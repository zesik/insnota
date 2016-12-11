module.exports = {
  // Database string of MongoDB used to store users, notes, sessions, etc.
  MONGO_URI: 'mongodb://localhost:27017/insnota',
  // Salt for generating HashID.
  // Do not change this setting after server starts for the first time.
  // Otherwise duplicate document IDs may occur.
  HASH_ID_SALT: 'this is my salt',
  // Identifier of current server.
  // Use different values for different servers and do not change it after server starts for the first time.
  SERVER_ID: '0',
  // Port of the server to listen to
  SERVER_PORT: 3000,
  // Whether to enforce reCAPTCHA when sign up.
  RECAPTCHA_SIGNUP: true,
  // reCAPTCHA site key for sign-up.
  RECAPTCHA_SIGNUP_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  // reCAPTCHA secret key for sign-up.
  RECAPTCHA_SIGNUP_SECRET_KEY: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  // Whether to enforce reCAPTCHA when verifying password.
  RECAPTCHA_PASSWORD: true,
  // reCAPTCHA site key for password verification.
  RECAPTCHA_PASSWORD_SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  // reCAPTCHA secret key for sign-in.
  RECAPTCHA_PASSWORD_SECRET_KEY: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  // Failed password attempts for an account before reCAPTCHA is required.
  RECAPTCHA_PASSWORD_ATTEMPTS: 5,
  // Whether to allow new users to sign up.
  ALLOW_SIGN_UP: true,
  // Secret for signed cookies.
  // Do not change this setting after server starts for the first time.
  // Otherwise previously stored cookies may become inaccessible.
  COOKIE_SECRET: 'keyboard cat',
  // Whether anonymous users (not signed in) can create documents.
  ALLOW_ANONYMOUS_CREATING: true,
  // TODO: Whether anonymous users (not signed in) can edit documents.
  ALLOW_ANONYMOUS_EDITING: true
};
