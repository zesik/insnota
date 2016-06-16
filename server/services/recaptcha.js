const https = require('https');
const config = require('../config');

const accountAttempts = config.reCAPTCHA.signIn && !isNaN(parseFloat(config.reCAPTCHA.signIn.accountAttempts)) ?
  config.reCAPTCHA.signIn.accountAttempts : -1;

function shouldCheckSignUp() {
  return !!config.reCAPTCHA.signUp;
}

function shouldCheckSignIn(attempts) {
  return (accountAttempts >= 0 && attempts >= accountAttempts);
}

function getSignInSiteKey() {
  return config.reCAPTCHA.signIn ? config.reCAPTCHA.signIn.siteKey : null;
}

function getSignUpSiteKey() {
  return config.reCAPTCHA.signUp ? config.reCAPTCHA.signUp.siteKey : null;
}

function verifySignIn(response, callback) {
  const secretKey = config.reCAPTCHA.signIn.secretKey;
  return verifyRecaptcha(secretKey, response, callback);
}

function verifySignUp(response, callback) {
  const secretKey = config.reCAPTCHA.signUp.secretKey;
  return verifyRecaptcha(secretKey, response, callback);
}

function verifyRecaptcha(secretKey, response, callback) {
  https.get(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${response}`, function (res) {
    let data = '';
    res.on('data', chunk => { data += chunk.toString() });
    res.on('end', function () {
      try {
        callback(JSON.parse(data).success);
      } catch (e) {
        callback(false);
      }
    });
  });
}

module.exports = {
  shouldCheckSignIn,
  shouldCheckSignUp,
  getSignInSiteKey,
  getSignUpSiteKey,
  verifySignIn,
  verifySignUp
};
