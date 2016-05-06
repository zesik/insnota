'use strict';

const crypto = require('crypto');
const User = require('../models/user');

const PBKDF2_ALGORITHM = 'pbkdf2';
const PBKDF2_DIGEST_METHOD = 'sha512';
const PBKDF2_SALT_BYTE_SIZE = 64;
const PBKDF2_ITERATIONS = 50000;
const PBKDF2_KEY_BYTE_SIZE = 64;

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

function createUser(name, email, password, callback) {
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
        callback(err);
      }
      callback(null, user);
    });
  });
}

function verifyUser(email, password, recaptcha, callback) {
  User.findOneAndUpdate({ email }, { $inc: { login_attempts: 1 } }, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback(null, false);
    }
    const params = user.password.split(':');
    const expected = params.splice(params.length - 1, 1)[0];
    generateHash(params, password, (err, key) => {
      if (err) {
        return callback(err);
      }
      callback(null, isStringEqual(key, expected) ? user : false);
    });
  });
}

function findUser(email, callback) {
  User.findOneByEmail(email, callback);
}

function resetLoginAttempts(email, callback) {
  User.resetLoginAttempts(email, callback);
}

module.exports = {
  createUser,
  verifyUser,
  findUser,
  resetLoginAttempts
};
