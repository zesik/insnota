module.exports = {
  // Configures the database string of MongoDB used to store users, notes, sessions, etc.
  'mongo': 'mongodb://localhost:27017/insnota',
  // Configures the salt for generating HashID.
  // Changing this settings after server starts for the first time may result in duplicate document IDs.
  'hashidSalt': 'this is my salt',
  // Configures identifier of current server.
  // Use different values for different servers and do not change after server starts for the first time.
  'serverID': '0',
  // Controls reCAPTCHA display. Set to `false` to disable reCAPTCHA.
  'reCAPTCHA': true,
  // Controls how to enforce reCAPTCHA when sign up. Set to `false` to disable this feature at all.
  'reCAPTCHA.signUp': true,
  // reCAPTCHA site key for sign-up.
  'reCAPTCHA.signUp.siteKey': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  // reCAPTCHA secret key for sign-up.
  'reCAPTCHA.signUp.secretKey': '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  // Controls how to enforce reCAPTCHA when verifying password. Set to `false` to disable this feature at all.
  'reCAPTCHA.password': true,
  // reCAPTCHA site key for sign-in.
  'reCAPTCHA.password.siteKey': '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  // reCAPTCHA secret key for sign-in.
  'reCAPTCHA.password.secretKey': '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
  // Failed attempts for an account before reCAPTCHA is required. Set to `false` to disable this feature.
  'reCAPTCHA.password.attempts': 5,
  // Whether new users can sign up.
  'allowSignUp': true,
  // Configures secret for signed cookies.
  // Changing this settings after server starts for the first time may cause previously stored cookies inaccessible.
  'cookieSecret': 'keyboard cat',
  // Configures name of the login cookie.
  'loginTokenName': 'login',
  // Controls whether anonymous users (not signed in) can create documents.
  'anonymousCreating': true,
  // TODO: Whether anonymous users (not signed in) can edit documents.
  'anonymousEditing': true,
  // Configure name of document collection.
  'documentCollection': 'notes'
};
