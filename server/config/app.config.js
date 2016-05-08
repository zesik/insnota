module.exports = {
  // Configures the database string of MongoDB used to store users, notes, sessions, etc.
  mongo: 'mongodb://localhost:27017/test',
  // Configures the salt for generating HashID.
  hashidSalt: 'this is my salt',
  // Controls identifier of current server.
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
    // Controls how to enforce reCAPTCHA when sign in. Set to `false` to disable this feature at all.
    signIn: {
      // reCAPTCHA site key for sign-in.
      siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
      // reCAPTCHA secret key for sign-in.
      secretKey: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe',
      // Failed attempts for an account before reCAPTCHA is required. Set to `false` to disable this feature.
      accountAttempts: 5,
      // TODO: Failed attempts for an IP address before reCAPTCHA is required. Set to `false` to disable this feature.
      ipAddress: false
    }
  },
  // Whether new users can sign up.
  allowSignUp: true,
  // TODO: Whether anonymous users (not signed in) can create documents.
  anonymousCreating: true,
  // TODO: Whether anonymous users (not signed in) can edit documents.
  anonymousEditing: true
};
