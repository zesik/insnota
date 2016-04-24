module.exports = {
  // Controls reCAPTCHA display. Set to `false` to disable reCAPTCHA.
  reCAPTCHA: {
    // reCAPTCHA site key.
    siteKey: '',
    // Whether to require reCAPTCHA when sign up.
    signUp: true,
    // Whether to require reCAPTCHA when sign in. Set to `true` to require reCAPTCHA immediately.
    signIn: {
      // Failed attempts for an account before reCAPTCHA is required.
      accountAttempts: 10,
      // Failed attempts for an IP address before reCAPTCHA is required.
      ipAddress: 10
    }
  },
  // Whether anonymous users (not signed in) can create documents.
  anonymousCreating: true,
  // Whether anonymous users (not signed in) can edit documents.
  anonymousEditing: true
};
