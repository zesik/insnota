const request = require('request');
const config = require('../config');
const logger = require('../logger');

const maxPasswordAttempts = (config.reCAPTCHA.password && typeof config.reCAPTCHA.password.attempts === 'number') ?
  config.reCAPTCHA.password.attempts : -1;

function shouldCheckSignUp() {
  return !!config.reCAPTCHA.signUp;
}

function shouldCheckPasswordAttempt(attempts) {
  return (maxPasswordAttempts >= 0 && attempts >= maxPasswordAttempts);
}

function getPasswordAttemptSiteKey(attempts) {
  return shouldCheckPasswordAttempt(attempts) ? config.reCAPTCHA.password.siteKey : null;
}

function getSignUpSiteKey() {
  return shouldCheckSignUp() ? config.reCAPTCHA.signUp.siteKey : null;
}

/**
 * @note reject() argument types: Error object or null (when reCAPTCHA invalid)
 */
function verifyRecaptcha(secret, response) {
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://www.google.com/recaptcha/api/siteverify',
      form: { secret, response }
    }, (err, res, body) => {
      if (err) {
        logger.error('Unable to verify reCAPTCHA');
        reject(err);
        return;
      }
      if (res.statusCode !== 200) {
        logger.error(`Unable to verify reCAPTCHA: ${res.statusCode}`);
        reject(new Error(`Unexpected status code: ${res.statusCode}`));
        return;
      }
      let result = false;
      try {
        result = JSON.parse(body).success;
      } catch (e) {
        logger.error(`Unable to parse result when verifying reCAPTCHA: ${e}`);
        reject(e);
        return;
      }
      if (!result) {
        reject();
        return;
      }
      resolve();
    });
  });
}

function verifyPasswordAttempt(passwordAttemptCount, response) {
  if (shouldCheckPasswordAttempt(passwordAttemptCount) || response) {
    const secretKey = config.reCAPTCHA.signIn.secretKey;
    return verifyRecaptcha(secretKey, response);
  }
  return new Promise(resolve => resolve());
}

function verifySignUp(response) {
  if (shouldCheckSignUp() || response) {
    const secretKey = config.reCAPTCHA.signUp.secretKey;
    return verifyRecaptcha(secretKey, response);
  }
  return new Promise(resolve => resolve());
}

module.exports = {
  getPasswordAttemptSiteKey,
  getSignUpSiteKey,
  verifyPasswordAttempt,
  verifySignUp
};
