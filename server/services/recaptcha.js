const request = require('request');
const config = require('../config');
const logger = require('../logger');

const maxPasswordAttempts = (config.reCAPTCHA.signIn && typeof config.reCAPTCHA.signIn.accountAttempts === 'number') ?
  config.reCAPTCHA.signIn.accountAttempts : -1;

function shouldCheckSignUp() {
  return !!config.reCAPTCHA.signUp;
}

function shouldCheckSignIn(attempts) {
  return (maxPasswordAttempts >= 0 && attempts >= maxPasswordAttempts);
}

function getSignInSiteKey(attempts) {
  return shouldCheckSignIn(attempts) ? config.reCAPTCHA.signIn.siteKey : null;
}

function getSignUpSiteKey() {
  return shouldCheckSignUp() ? config.reCAPTCHA.signUp.siteKey : null;
}

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
        reject();
        return;
      }
      let result = false;
      try {
        result = JSON.parse(body).success;
      } catch (e) {
        logger.error(`Unable to parse result when verifying reCAPTCHA: ${e}`);
      }
      if (!result) {
        reject();
        return;
      }
      resolve();
    });
  });
}

function verifySignIn(passwordAttemptCount, response) {
  if (shouldCheckSignIn(passwordAttemptCount) || response) {
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
  getSignInSiteKey,
  getSignUpSiteKey,
  verifySignIn,
  verifySignUp
};
