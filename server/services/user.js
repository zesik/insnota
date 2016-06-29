const crypto = require('crypto');
const mongoose = require('mongoose');
const logger = require('../logger');
const User = require('../models/user');
const LoginToken = require('../models/loginToken');

const PBKDF2_ALGORITHM = 'pbkdf2';
const PBKDF2_DIGEST_METHOD = 'sha512';
const PBKDF2_SALT_BYTE_SIZE = 64;
const PBKDF2_ITERATIONS = 50000;
const PBKDF2_KEY_BYTE_SIZE = 64;
const TOKEN_BYTE_SIZE = 20;
const LOGIN_TOKEN_EXPIRE_DAYS = 14;

function generateHash(params, password) {
  return new Promise((resolve, reject) => {
    const algorithm = params[0];
    switch (algorithm) {
      case PBKDF2_ALGORITHM: {
        const digest = params[1];
        const iterations = parseInt(params[2], 10);
        const keyByteSize = parseInt(params[3], 10);
        const salt = params[4];
        crypto.pbkdf2(password, salt, iterations, keyByteSize, digest, (err, key) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(key.toString('hex'));
        });
        break;
      }
      default:
        reject(new Error(`Unsupported algorithm '${algorithm}'`));
        break;
    }
  });
}

function isStringEqual(str1, str2) {
  const minLength = Math.min(str1.length, str2.length);
  let diff = str1.length ^ str2.length;
  for (let i = 0; i < minLength; ++i) {
    diff |= parseInt(str1[i], 16) ^ parseInt(str2[i], 16);
  }
  return diff === 0;
}

function createUser(name, email, password) {
  return new Promise((resolve, reject) => {
    const params = [
      PBKDF2_ALGORITHM,
      PBKDF2_DIGEST_METHOD,
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_BYTE_SIZE,
      crypto.randomBytes(PBKDF2_SALT_BYTE_SIZE).toString('hex')
    ];
    generateHash(params, password).then(hash => {
      params.push(hash);
      const user = new User();
      user.email = email;
      user.password = params.join(':');
      user.name = name;
      user.status = 'unverified';
      user.save(err => {
        if (err) {
          if (err.name === 'MongoError' && err.code === 11000) {
            logger.warn('Duplication found when creating user');
            reject();
            return;
          }
          logger.error('Database error when creating user');
          reject(err);
          return;
        }
        resolve(user);
      });
    }).catch(err => {
      logger.error('Hashing error when creating user');
      reject(err);
    });
  });
}

function verifyPassword(user, password) {
  return new Promise((resolve, reject) => {
    if (!user) {
      reject();
      return;
    }
    const params = user.password.split(':');
    const expected = params.splice(params.length - 1, 1)[0];
    generateHash(params, password).then(hash => {
      if (isStringEqual(hash, expected)) {
        User.findOneAndUpdate({ _id: user._id }, { password_attempts: 0 }, { new: true }, (err, newUser) => {
          if (err) {
            logger.error('Database error while updating user password attempt');
            reject(err);
            return;
          }
          resolve(newUser);
        });
        return;
      }
      User.findOneAndUpdate({ _id: user._id }, { $inc: { password_attempts: 1 } }, { new: true }, (err, newUser) => {
        if (err) {
          logger.error('Database error while updating user password attempt');
          reject(err);
          return;
        }
        reject(newUser);
      });
    }).catch(err => {
      logger.error('Hashing error when verifying password');
      reject(err);
    });
  });
}

function findUser(id) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: id }, (err, user) => {
      if (err) {
        logger.error('Database error when finding user');
        reject(err);
        return;
      }
      if (!user) {
        reject();
        return;
      }
      resolve(user);
    });
  });
}

function findUsers(ids) {
  return new Promise((resolve, reject) => {
    User.find({ _id: { $in: ids } }, (err, users) => {
      if (err) {
        logger.error('Database error when finding user');
        reject(err);
        return;
      }
      resolve(users);
    });
  });
}

function findUserByEmail(email) {
  return new Promise((resolve, reject) => {
    User.findOneByEmail(email, (err, user) => {
      if (err) {
        logger.error('Database error when finding user');
        reject(err);
        return;
      }
      if (!user) {
        reject();
        return;
      }
      resolve(user);
    });
  });
}

function findUsersByEmails(emails) {
  return new Promise((resolve, reject) => {
    User.find({ email: { $in: emails } }, (err, users) => {
      if (err) {
        logger.error('Database error when finding user');
        reject(err);
        return;
      }
      resolve(users);
    });
  });
}

function issueLoginToken(userID) {
  return new Promise((resolve, reject) => {
    const tokenID = ((new mongoose.Types.ObjectId()).toString() +
      crypto.randomBytes(TOKEN_BYTE_SIZE).toString('hex')).toLowerCase();
    const date = new Date();
    date.setDate(date.getDate() + LOGIN_TOKEN_EXPIRE_DAYS);
    const token = new LoginToken();
    token._id = tokenID;
    token.expires = date;
    token.user_id = userID;
    token.save(err => {
      if (err) {
        logger.error('Database error when issuing new login token');
        reject(err);
        return;
      }
      resolve(token);
    });
  });
}

function verifyLoginToken(id) {
  return new Promise((resolve, reject) => {
    LoginToken.findOneAndUpdate({ _id: id }, { $set: { used: true } }, (err, token) => {
      if (err) {
        logger.error('Database error when verifying login token');
        reject(err);
        return;
      }
      if (token.used) {
        logger.warn('Used login token detected');
        reject('used');
        return;
      }
      if (new Date() > token.expires) {
        logger.warn('Expired login token detected');
        reject('used');
        return;
      }
      resolve(token.user_id);
    });
  });
}

function updateName(id, name) {
  return new Promise((resolve, reject) => {
    User.update({ _id: id }, { name }, err => {
      if (err) {
        logger.error('Database error when updating user profile');
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function updatePassword(id, password) {
  return new Promise((resolve, reject) => {
    const params = [
      PBKDF2_ALGORITHM,
      PBKDF2_DIGEST_METHOD,
      PBKDF2_ITERATIONS,
      PBKDF2_KEY_BYTE_SIZE,
      crypto.randomBytes(PBKDF2_SALT_BYTE_SIZE).toString('hex')
    ];
    generateHash(params, password).then(hash => {
      params.push(hash);
      User.update({ _id: id }, { password: params.join(':') }, err => {
        if (err) {
          logger.error('Database error when updating user password');
          reject(err);
          return;
        }
        resolve();
      });
    }).catch(err => {
      logger.error('Hashing error when updating password');
      reject(err);
    });
  });
}

module.exports = {
  createUser,
  verifyPassword,
  findUser,
  findUserByEmail,
  findUsers,
  findUsersByEmails,
  issueLoginToken,
  verifyLoginToken,
  updateName,
  updatePassword
};
