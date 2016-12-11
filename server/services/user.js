const crypto = require('crypto');
const mongoose = require('mongoose');
const consts = require('../const');
const { ClientError, ClientErrorCode } = require('../error');
const config = require('../config');
const logger = require('../logger');
const User = require('../models/user');
const LoginToken = require('../models/loginToken');

/**
 * Generates hash for a given password.
 *
 * @param {string|null} params Parameter set. If null, default parameter set will be used.
 * @param {string} password Password to calculate hash.
 * @returns {Promise}
 */
function generateHash(params, password) {
  return new Promise((resolve, reject) => {
    let hashParameters;
    let newParameterSet = false;
    if (params) {
      hashParameters = params.split(consts.PASSWORD_HASH_ALGORITHM_PARAMETER_SEPARATOR);
    } else {
      newParameterSet = true;
      hashParameters = config.PASSWORD_HASH_PARAMETERS.split(consts.PASSWORD_HASH_ALGORITHM_PARAMETER_SEPARATOR);
    }
    const algorithm = hashParameters[0];
    switch (algorithm) {
      case consts.PASSWORD_HASH_ALGORITHM_PBKDF2: {
        const digest = hashParameters[1];
        const iterations = parseInt(hashParameters[2], 10);
        const keyByteSize = parseInt(hashParameters[3], 10);
        let salt = hashParameters[4];
        if (newParameterSet) {
          salt = crypto.randomBytes(parseInt(salt, 10)).toString('hex');
          hashParameters[4] = salt;
        }
        crypto.pbkdf2(password, salt, iterations, keyByteSize, digest, (err, key) => {
          if (err) {
            logger.error(`Failed to run the PBKDF2 algorithm: ${err}`);
            reject(err);
            return;
          }
          resolve(hashParameters.concat(key.toString('hex')));
        });
        break;
      }
      default:
        logger.error(`Unknown algorithm: ${algorithm}`);
        reject(new Error(`Unknown algorithm: '${algorithm}'`));
        break;
    }
  });
}

/**
 * Determines whether two strings are equal with constant time.
 *
 * @param {string} str1 The first string.
 * @param {string} str2 The second string.
 * @returns {boolean} true if the two strings are equal.
 */
function isStringEqual(str1, str2) {
  const minLength = Math.min(str1.length, str2.length);
  let diff = str1.length ^ str2.length;
  for (let i = 0; i < minLength; ++i) {
    diff |= parseInt(str1[i], 16) ^ parseInt(str2[i], 16);
  }
  return diff === 0;
}

/**
 * Creates a new user.
 *
 * @param {string} name Name of the new user.
 * @param {string} email Email of the new user.
 * @param {string} password Password of the new user.
 * @returns {Promise}
 */
function createUser(name, email, password) {
  return generateHash(null, password)
    .then((hash) => {
      const user = new User();
      user.email = email;
      user.password = hash.join(consts.PASSWORD_HASH_ALGORITHM_PARAMETER_SEPARATOR);
      user.name = name;
      user.status = 'unverified';
      return user.save().then(() => user);
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ClientError(ClientErrorCode.ERROR_DUPLICATED_USER);
      }
      throw err;
    });
}

/**
 * Verifies whether provided password matches the stored one for a user.
 * The verification process also increment or reset failed password attempt count for the user.
 *
 * @params {User} user The user.
 * @params {string} password Provided password.
 * @returns {Promise}
 */
function verifyPassword(user, password) {
  return generateHash(user.password, password)
    .then((hash) => {
      if (isStringEqual(hash[hash.length - 2], hash[hash.length - 1])) {
        return User.findOneAndUpdate({ _id: user._id }, { password_attempts: 0 }, { new: true }).exec();
      }
      return User.findOneAndUpdate({ _id: user._id }, { $inc: { password_attempts: 1 } }, { new: true }).exec();
    })
    .then((newUser) => {
      if (newUser.password_attempts) {
        throw new ClientError(ClientErrorCode.ERROR_PASSWORD_MISMATCH, newUser);
      }
      return newUser;
    });
}

/**
 * Finds a user by on its ID.
 *
 * @params {ObjectId} id User ID.
 * @returns {Promise}
 */
function findUser(id) {
  return User.findOne({ _id: id }).exec()
    .then((user) => {
      if (!user) {
        throw new ClientError(ClientErrorCode.ERROR_USER_NOT_FOUND);
      }
      return user;
    });
}

/**
 * Finds a user by its email address.
 *
 * @params {string} email Email address of the user.
 * @returns {Promise}
 */
function findUserByEmail(email) {
  return User.findOne({ email }).exec()
    .then((user) => {
      if (!user) {
        throw new ClientError(ClientErrorCode.ERROR_USER_NOT_FOUND);
      }
      return user;
    });
}

/**
 * Find users by a list of user ID.
 *
 * @params {Array.<ObjectId>} ids List of user IDs.
 * @returns {Promise}
 */
function findUsers(ids) {
  return User.find({ _id: { $in: ids } }).exec();
}

/**
 * Finds users by their email addresses.
 *
 * @params {Array.<string>} emails List of user email addresses.
 * @returns {Promise}
 */
function findUsersByEmails(emails) {
  return User.find({ email: { $in: emails } }).exec();
}

/**
 * Issues a new login token.
 *
 * @params {User} user User to which the login token belongs.
 * @returns {Promise}
 */
function issueLoginToken(user) {
  const userID = user._id;
  const tokenID = ((new mongoose.Types.ObjectId()).toString() +
    crypto.randomBytes(config.LOGIN_TOKEN_BYTE_SIZE).toString('hex')).toLowerCase();
  const date = new Date();
  date.setDate(date.getDate() + config.LOGIN_TOKEN_EXPIRE_DAYS);
  const token = new LoginToken();
  token._id = tokenID;
  token.expires = date;
  token.user_id = userID;
  return token.save().then(() => ({ user, token }));
}

/**
 * Verifies whether a login token is valid and get corresponding user.
 *
 * @params {string} loginToken The login token.
 * @returns {Promise}
 */
function verifyLoginToken(loginToken) {
  return LoginToken.findOneAndUpdate({ _id: loginToken.id }, { $set: { used: true } }).exec()
    .then((token) => {
      if (!token) {
        logger.warn('Login token not found');
        throw new ClientError(ClientErrorCode.ERROR_LOGIN_TOKEN_NOT_FOUND);
      }
      if (token.used) {
        logger.warn('Used login token detected');
        throw new ClientError(ClientErrorCode.ERROR_LOGIN_TOKEN_USED);
      }
      if (new Date() > token.expires) {
        logger.warn('Expired login token detected');
        throw new ClientError(ClientErrorCode.ERROR_LOGIN_TOKEN_EXPIRED);
      }
      return token.user_id;
    });
}

/**
 * Updates name of a user.
 *
 * @params {User} user The user whose name should be updated.
 * @returns {Promise}
 */
function updateUserName(user, name) {
  return User.update({ _id: user._id }, { name }).exec();
}

/**
 * Updates password of a user.
 *
 * @params {User} user The user whose password should be updated.
 * @returns {Promise}
 */
function updateUserPassword(user, password) {
  return generateHash(null, password)
    .then(hash => User.update({ _id: user._id }, { password: hash.join(':') }).exec());
}

/**
 * Resets password attempt count of a user.

 * @param {User} user The user whose password attempt count should be reset.
 * @returns {Promise}
 */
function resetUserPasswordAttempts(user) {
  return User.update({ _id: user._id }, { $set: { password_attempts: 0 } }).exec();
}

/**
 * An express middleware to deserialize user information.
 */
function deserializeUser(req, res, next) {
  // First try to deserialize user from session
  if (req.session.userID) {
    findUser(req.session.userID)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => {
        if (err instanceof ClientError && err.errorCode === ClientErrorCode.ERROR_USER_NOT_FOUND) {
          next();
          return;
        }
        next(err);
      });
    return;
  }
  // Check whether the user has login token
  if (!req.upgrade && req.signedCookies[config.LOGIN_TOKEN_NAME]) {
    verifyLoginToken(req.signedCookies[config.LOGIN_TOKEN_NAME])
      .then((userID) => {
        res.clearCookie(config.LOGIN_TOKEN_NAME, {});
        return findUser(userID);
      })
      .then(user => issueLoginToken(user))
      .then(({ user, token }) => {
        req.session.userID = token.user._id;
        req.user = user;
        res.cookie(config.LOGIN_TOKEN_NAME, token._id, {
          expires: token.expires,
          signed: true
        });
        next();
      })
      .catch((err) => {
        if (err instanceof ClientError) {
          switch (err.errorCode) {
            case ClientErrorCode.ERROR_LOGIN_TOKEN_NOT_FOUND:
            case ClientErrorCode.ERROR_LOGIN_TOKEN_USED:
            case ClientErrorCode.ERROR_LOGIN_TOKEN_EXPIRED:
              res.clearCookie(config.LOGIN_TOKEN_NAME, {});
              next();
              return;
            default:
              break;
          }
        }
        next(err);
      });
    return;
  }
  next();
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
  updateUserName,
  updateUserPassword,
  resetUserPasswordAttempts,
  deserializeUser
};
