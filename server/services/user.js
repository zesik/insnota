'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
const recaptchaService = require('../services/recaptcha');
const User = require('../models/user');
const LoginToken = require('../models/loginToken');

const PBKDF2_ALGORITHM = 'pbkdf2';
const PBKDF2_DIGEST_METHOD = 'sha512';
const PBKDF2_SALT_BYTE_SIZE = 64;
const PBKDF2_ITERATIONS = 50000;
const PBKDF2_KEY_BYTE_SIZE = 64;
const TOKEN_BYTE_SIZE = 20;
const LOGIN_TOKEN_EXPIRE_DAYS = 14;

function generateHash(params, password, callback) {
  const algorithm = params[0];
  switch (params[0]) {
    case PBKDF2_ALGORITHM: {
      const digest = params[1];
      const iterations = parseInt(params[2], 10);
      const keyByteSize = parseInt(params[3], 10);
      const salt = params[4];
      crypto.pbkdf2(password, salt, iterations, keyByteSize, digest, (err, key) => {
        if (err) {
          return callback(err);
        }
        callback(null, key.toString('hex'));
      });
      break;
    }
    default:
      process.nextTick(() => callback(new TypeError(`Unknown algorithm '${params[0]}'`)));
      break;
  }
}

function isStringEqual(str1, str2) {
  const minLength = Math.min(str1.length, str2.length);
  let diff = str1.length ^ str2.length;
  for (let i = 0; i < minLength; ++i) {
    diff |= parseInt(str1[i], 16) ^ parseInt(str2[i], 16);
  }
  return diff === 0;
}

function createUser(name, email, password, recaptchaSiteKey, callback) {
  const descriptor = [
    PBKDF2_ALGORITHM,
    PBKDF2_DIGEST_METHOD,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_BYTE_SIZE,
    crypto.randomBytes(PBKDF2_SALT_BYTE_SIZE).toString('hex')
  ];
  generateHash(descriptor, password, (err, hash) => {
    if (err) {
      return callback(err);
    }
    descriptor.push(hash);
    const user = new User();
    user.email = email;
    user.password = descriptor.join(':');
    user.name = name;
    user.status = 'unverified';
    user.save((err) => {
      if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
          return callback(null, { duplicate: 1, siteKey: recaptchaSiteKey });
        }
        return callback(err);
      }
      callback(null, { user });
    });
  });
}

function createUserWithRecaptcha(name, email, password, recaptcha, callback) {
  let recaptchaSiteKey = '';
  if (recaptcha || recaptchaService.shouldCheckSignUp()) {
    recaptchaSiteKey = recaptchaService.getSignUpSiteKey();
    recaptchaService.verifySignUp(recaptcha, result => {
      if (result) {
        return createUser(name, email, password, recaptchaSiteKey, callback);
      }
      callback(null, { recaptcha: 1, siteKey: recaptchaSiteKey });
    });
    return;
  }
  createUser(name, email, password, recaptchaSiteKey, callback);
}

function verifyUserWithRecaptcha(email, password, recaptcha, callback) {
  User.findOneAndUpdate({ email }, { $inc: { login_attempts: 1 } }, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback();
    }
    let recaptchaSiteKey = '';
    if (recaptcha || recaptchaService.shouldCheckSignIn(user.login_attempts)) {
      recaptchaSiteKey = recaptchaService.getSignInSiteKey();
      recaptchaService.verifySignIn(recaptcha, result => {
        if (result) {
          return verifyPassword(user, password, recaptchaSiteKey, callback);
        }
        callback(null, { recaptcha: 1, siteKey: recaptchaSiteKey });
      });
      return;
    }
    if (recaptchaService.shouldCheckSignIn(user.login_attempts + 1)) {
      recaptchaSiteKey = recaptchaService.getSignInSiteKey();
    }
    verifyPassword(user, password, recaptchaSiteKey, callback);
  });
}

function verifyPassword(user, password, recaptchaSiteKey, callback) {
  const params = user.password.split(':');
  const expected = params.splice(params.length - 1, 1)[0];
  generateHash(params, password, (err, key) => {
    if (err) {
      return callback(err);
    }
    const result = {};
    if (isStringEqual(key, expected)) {
      result.user = user;
    } else {
      result.password = 1;
      result.siteKey = recaptchaSiteKey;
    }
    callback(null, result);
  });
}

function findUser(email, callback) {
  User.findOneByEmail(email, callback);
}

function findUsersIn(emails, callback) {
  User.find({ email: { $in: emails }}, callback);
}

function resetLoginAttempts(email, callback) {
  User.resetLoginAttempts(email, callback);
}

function issueLoginToken(email, callback) {
  const tokenID = (mongoose.Types.ObjectId().toString() +
    crypto.randomBytes(TOKEN_BYTE_SIZE).toString('hex')).toLowerCase();
  const date = new Date();
  date.setDate(date.getDate() + LOGIN_TOKEN_EXPIRE_DAYS);
  const token = new LoginToken();
  token._id = tokenID;
  token.expires = date;
  token.email = email;
  token.save(function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, token);
  });
}

function verifyLoginToken(token, callback) {
  LoginToken.findOneAndUpdate({ _id: token }, { $set: { used: true } }, function (err, doc) {
    if (err) {
      return callback(err);
    }
    if (doc.used) {
      return callback(null, { valid: false, reason: 'used' });
    }
    if (new Date() > doc.expires) {
      return callback(null, { valid: false, reason: 'expired' });
    }
    return callback(null, { valid: true, email: doc.email });
  });
}

module.exports = {
  createUserWithRecaptcha,
  verifyUserWithRecaptcha,
  findUser,
  findUsersIn,
  resetLoginAttempts,
  issueLoginToken,
  verifyLoginToken
};
