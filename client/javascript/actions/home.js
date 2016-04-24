import 'whatwg-fetch';
import {
  validateName,
  validateEmail,
  validateSignInPassword,
  validateSignUpPassword,
  validatePasswordConfirm
} from '../utils/form';

export const UPDATE_VISITOR_IDENTITY = 'UPDATE_VISITOR_IDENTITY';
export const RESET_FORM = 'RESET_FORM';
export const UPDATE_FORM_STATUS = 'UPDATE_FORM_STATUS';
export const EDIT_FORM_NAME = 'EDIT_FORM_NAME';
export const EDIT_FORM_EMAIL = 'EDIT_FORM_EMAIL';
export const EDIT_FORM_PASSWORD = 'EDIT_FORM_PASSWORD';
export const EDIT_FORM_PASSWORD_CONFIRM = 'EDIT_FORM_PASSWORD_CONFIRM';

export function checkVisitorIdentity() {
  return dispatch => {
    dispatch(updateVisitorIdentity(true, null));
    fetch('/api/user', {
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }).then(function (json) {
      dispatch(updateVisitorIdentity(false, json.email || null));
    }).catch(function (err) {
      dispatch(updateVisitorIdentity(false, null));
      console.error(err);
    });
  }
}

function updateVisitorIdentity(checkingVisitorIdentity, visitorIdentity) {
  return { type: UPDATE_VISITOR_IDENTITY, checkingVisitorIdentity, visitorIdentity };
}

export function resetForm() {
  return { type: RESET_FORM };
}

export function updateFormStatus(formSubmitting, validations) {
  return { type: UPDATE_FORM_STATUS, formSubmitting, validations };
}

export function editFormName(formName) {
  return { type: EDIT_FORM_NAME, formName };
}

export function editFormEmail(formEmail) {
  return { type: EDIT_FORM_EMAIL, formEmail };
}

export function editFormPassword(formPassword) {
  return { type: EDIT_FORM_PASSWORD, formPassword };
}

export function editFormPasswordConfirm(formPasswordConfirm) {
  return { type: EDIT_FORM_PASSWORD_CONFIRM, formPasswordConfirm };
}

export function validateFormName(name) {
  return updateFormStatus(false, validateName(name));
}

export function resetFormNameValidation() {
  return updateFormStatus(false, {
    formValidationNameEmpty: false
  });
}

export function validateFormSignInEmail(email) {
  return updateFormStatus(false, validateEmail(email));
}

export function validateFormSignUpEmail(email) {
  return (dispatch, getState) => {
    dispatch(updateFormStatus(false, validateEmail(email)));
    const { formValidationEmailEmpty, formValidationEmailInvalid } = getState().home;
    if (formValidationEmailEmpty || formValidationEmailInvalid) {
      return;
    }
  };
}

export function resetFormEmailValidation() {
  return updateFormStatus(false, {
    formValidatingEmail: false,
    formValidationEmailEmpty: false,
    formValidationEmailInvalid: false,
    formValidationEmailOccupied: false
  });
}

export function validateFormSignInPassword(password) {
  return updateFormStatus(false, validateSignInPassword(password));
}

export function validateFormSignUpPassword(password) {
  return updateFormStatus(false, validateSignUpPassword(password));
}

export function validateFormPasswordConfirm(password, passwordConfirm) {
  return updateFormStatus(false, validatePasswordConfirm(password, passwordConfirm));
}

export function resetFormPasswordValidation() {
  return updateFormStatus(false, {
    formValidationPasswordEmpty: false,
    formValidationPasswordShort: false
  });
}

export function resetFormPasswordConfirmValidation() {
  return updateFormStatus(false, {
    formValidationPasswordMismatch: false
  });
}

export function submitSignUpForm(name, email, password) {
  return (dispatch, getState) => {
    dispatch(updateFormStatus(false, {
      serverError: false,
      formValidationCredentialInvalid: false
    }));
    const {
      formValidationNameEmpty,
      formValidationEmailEmpty,
      formValidationEmailInvalid,
      formValidationEmailOccupied,
      formValidationPasswordEmpty,
      formValidationPasswordShort,
      formValidationPasswordMismatch
    } = getState().home;
    if (formValidationNameEmpty ||
      formValidationEmailEmpty || formValidationEmailInvalid || formValidationEmailOccupied ||
      formValidationPasswordEmpty || formValidationPasswordShort || formValidationPasswordMismatch) {
      return;
    }
    dispatch(updateFormStatus(true, {}));
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }).then(function () {
      window.location = '/notes';
    }).catch(function (err) {
      if (err.response.status === 400 || err.response.status === 409) {
        err.response.json().then(function (json) {
          dispatch(updateFormStatus(false, json));
        });
      } else {
        console.error(err);
        dispatch(updateFormStatus(false, { serverError: true }));
      }
    });
  };
}

export function submitSignInForm(email, password) {
  return (dispatch, getState) => {
    dispatch(updateFormStatus(false, {
      serverError: false,
      formValidationCredentialInvalid: false
    }));
    const { formValidationEmailEmpty, formValidationEmailInvalid, formValidationPasswordEmpty } = getState().home;
    if (formValidationEmailEmpty || formValidationEmailInvalid || formValidationPasswordEmpty) {
      return;
    }
    dispatch(updateFormStatus(true, {}));
    fetch('/signin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.trim(), password }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }).then(function () {
      window.location = '/notes';
    }).catch(function (err) {
      if (err.response.status === 400 || err.response.status === 403) {
        err.response.json().then(function (json) {
          dispatch(updateFormStatus(false, json));
        });
      } else {
        console.error(err);
        dispatch(updateFormStatus(false, { serverError: true }));
      }
    });
  };
}

