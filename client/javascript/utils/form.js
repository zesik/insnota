export function validateName(name) {
  if (name.trim().length === 0) {
    return { formValidationNameEmpty: true };
  }
  return {};
}

export function validateEmail(email) {
  if (email.trim().length === 0) {
    return {
      formValidationEmailEmpty: true
    };
  }
  if (!/.+@.+/.test(email.trim())) {
    return {
      formValidationEmailInvalid: true
    };
  }
  return {};
}

export function validateSignInPassword(password) {
  if (password.length === 0) {
    return {
      formValidationPasswordEmpty: true
    };
  }
  return {};
}

export function validateSignUpPassword(password) {
  if (password.length === 0) {
    return {
      formValidationPasswordEmpty: true
    };
  }
  if (password.length < 6) {
    return {
      formValidationPasswordShort: true
    };
  }
  return {};
}

export function validatePasswordConfirm(password, passwordConfirm) {
  if (password !== passwordConfirm) {
    return { formValidationPasswordConfirmMismatch: true };
  }
  return {};
}
