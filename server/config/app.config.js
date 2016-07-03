module.exports = {
  // Configures the database string of MongoDB used to store users, notes, sessions, etc.
  mongo: 'mongodb://localhost:27017/test',
  // Configures the salt for generating HashID.
  hashidSalt: 'this is my salt',
  // Configures identifier of current server.
  serverID: '0',
  // Controls reCAPTCHA display. Set to `false` to disable reCAPTCHA.
  reCAPTCHA: {
    // Controls how to enforce reCAPTCHA when sign up. Set to `false` to disable this feature at all.
    signUp: {
      // reCAPTCHA site key for sign-up.
      siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      // reCAPTCHA secret key for sign-up.
      secretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
    },
    // Controls how to enforce reCAPTCHA when verifying password. Set to `false` to disable this feature at all.
    password: {
      // reCAPTCHA site key for sign-in.
      siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      // reCAPTCHA secret key for sign-in.
      secretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
      // Failed attempts for an account before reCAPTCHA is required. Set to `false` to disable this feature.
      attempts: 5
    }
  },
  // Whether new users can sign up.
  allowSignUp: true,
  // Configures secret for signed cookies.
  cookieSecret: 'keyboard cat',
  // Configures name of the login cookie.
  loginTokenName: 'login',
  // TODO: Controls whether anonymous users (not signed in) can create documents.
  anonymousCreating: true,
  // TODO: Whether anonymous users (not signed in) can edit documents.
  anonymousEditing: true,
  // Configure name of document collection.
  documentCollection: 'notes'
};
