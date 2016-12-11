const request = require('request');
const { ClientError, ClientErrorCode } = require('../error');
const config = require('../config');
const logger = require('../logger');

const RECAPTCHA_VERIFYING_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MAX_PASSWORD_ATTEMPTS = config.RECAPTCHA_PASSWORD ? config.RECAPTCHA_PASSWORD_ATTEMPTS : -1;

function shouldCheckPasswordAttempt(attempts) {
  return (MAX_PASSWORD_ATTEMPTS >= 0 && attempts >= MAX_PASSWORD_ATTEMPTS);
}

function getPasswordAttemptSiteKey(attempts) {
  return shouldCheckPasswordAttempt(attempts) ? config.RECAPTCHA_PASSWORD_SITE_KEY : null;
}

function shouldCheckSignUp() {
  return config.RECAPTCHA_SIGNUP;
}

function getSignUpSiteKey() {
  return shouldCheckSignUp() ? config.RECAPTCHA_SIGNUP_SITE_KEY : null;
}

/**
 * @returns {Promise}
 */
function verifyRecaptcha(secret, response) {
  return new Promise((resolve, reject) => {
    request.post({ url: RECAPTCHA_VERIFYING_URL, form: { secret, response } }, (err, res, body) => {
      if (err) {
        reject(err);
        return;
      }
      if (res.statusCode !== 200) {
        logger.error(`Unexpected status code when verifying reCAPTCHA: ${res.statusCode}`);
        reject(new Error(`Unexpected status code: ${res.statusCode}`));
        return;
      }
      let result = false;
      try {
        result = JSON.parse(body).success;
      } catch (e) {
        logger.error(`Malformed response when verifying reCAPTCHA: ${e}`);
        reject(e);
        return;
      }
      if (!result) {
        logger.debug('reCAPTCHA mismatch');
        reject(new ClientError(ClientErrorCode.ERROR_RECAPTCHA_MISMATCH));
        return;
      }
      resolve();
    });
  });
}

/**
 * @returns {Promise}
 */
function verifyPasswordAttempt(passwordAttemptCount, response) {
  if (shouldCheckPasswordAttempt(passwordAttemptCount) || response) {
    const secretKey = config.RECAPTCHA_PASSWORD_SECRET_KEY;
    return verifyRecaptcha(secretKey, response);
  }
  return Promise.resolve();
}

/**
 * @returns {Promise}
 */
function verifySignUp(response) {
  if (shouldCheckSignUp() || response) {
    const secretKey = config.RECAPTCHA_SIGNUP_SECRET_KEY;
    return verifyRecaptcha(secretKey, response);
  }
  return Promise.resolve();
}

module.exports = {
  getPasswordAttemptSiteKey,
  getSignUpSiteKey,
  verifyPasswordAttempt,
  verifySignUp
};
