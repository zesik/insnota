export function validateName(name) {
  if (name.trim().length === 0) {
    return { validationNameEmpty: true };
  }
  return {};
}

export function validateEmail(email) {
  if (email.trim().length === 0) {
    return { validationEmailEmpty: true };
  }
  if (!/[^@]+@[^@]+/.test(email.trim())) {
    return { validationEmailInvalid: true };
  }
  return {};
}

export function validateSignInPassword(password) {
  if (password.length === 0) {
    return { validationPasswordEmpty: true };
  }
  return {};
}

export function validateSignUpPassword(password) {
  if (password.length === 0) {
    return { validationPasswordEmpty: true };
  }
  if (password.length < 6) {
    return { validationPasswordShort: true };
  }
  return {};
}

export function validatePasswordConfirm(password, passwordConfirm) {
  if (password !== passwordConfirm) {
    return { validationPasswordConfirmMismatch: true };
  }
  return {};
}
