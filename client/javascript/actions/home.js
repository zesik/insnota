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
export const UPDATE_FORM_SUBMITTING = 'UPDATE_FORM_SUBMITTING';
export const UPDATE_FORM_VALIDATIONS = 'UPDATE_FORM_VALIDATIONS';
export const UPDATE_SIGNIN_FORM_STEP = 'UPDATE_SIGNIN_FORM_STEP';
export const EDIT_FORM_NAME = 'EDIT_FORM_NAME';
export const EDIT_FORM_EMAIL = 'EDIT_FORM_EMAIL';
export const EDIT_FORM_PASSWORD = 'EDIT_FORM_PASSWORD';
export const EDIT_FORM_PASSWORD_CONFIRM = 'EDIT_FORM_PASSWORD_CONFIRM';

function getUserInformation(email) {
  return new Promise(function (resolve, reject) {
    fetch(`/api/users/${email}`, {
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }).then(function (json) {
      return resolve(json);
    }).catch(function (err) {
      if (err.response.status === 404) {
        return resolve(null);
      }
      return reject(err);
    });
  });
}

function updateVisitorIdentity(checkingVisitorIdentity, visitorIdentity) {
  return { type: UPDATE_VISITOR_IDENTITY, checkingVisitorIdentity, visitorIdentity };
}

export function checkVisitorIdentity() {
  return dispatch => {
    dispatch(updateVisitorIdentity(true, null));
    fetch('/api/user', {
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }).then(function (json) {
      dispatch(updateVisitorIdentity(false, json.email || null));
    }).catch(function (err) {
      dispatch(updateVisitorIdentity(false, null));
      console.error(err);
    });
  };
}

export function resetForm() {
  return { type: RESET_FORM };
}

export function updateFormSubmitting(formSubmitting) {
  return { type: UPDATE_FORM_SUBMITTING, formSubmitting };
}

export function updateFormValidations(validations) {
  return { type: UPDATE_FORM_VALIDATIONS, validations };
}

export function updateSignInFormStep(step) {
  return { type: UPDATE_SIGNIN_FORM_STEP, step };
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
  return updateFormValidations(validateName(name));
}

export function resetFormNameValidation() {
  return updateFormValidations({ formValidationNameEmpty: false });
}

export function validateFormSignInEmail(email) {
  return updateFormValidations(validateEmail(email));
}

export function validateFormSignUpEmail(email) {
  return (dispatch, getState) => {
    dispatch(updateFormValidations(validateEmail(email)));
    const { formValidationEmailEmpty, formValidationEmailInvalid } = getState().home;
    if (formValidationEmailEmpty || formValidationEmailInvalid) {
      return;
    }
  };
}

export function resetFormEmailValidation() {
  return updateFormValidations({
    formValidatingEmail: false,
    formValidationEmailEmpty: false,
    formValidationEmailInvalid: false,
    formValidationEmailOccupied: false,
    formValidationEmailNotExist: false
  });
}

export function validateFormSignInPassword(password) {
  return updateFormValidations(validateSignInPassword(password));
}

export function validateFormSignUpPassword(password) {
  return updateFormValidations(validateSignUpPassword(password));
}

export function validateFormPasswordConfirm(password, passwordConfirm) {
  return updateFormValidations(validatePasswordConfirm(password, passwordConfirm));
}

export function resetFormPasswordValidation() {
  return updateFormValidations({
    formValidationPasswordEmpty: false,
    formValidationPasswordShort: false,
    formValidationCredentialInvalid: false
  });
}

export function resetFormPasswordConfirmValidation() {
  return updateFormValidations({ formValidationPasswordConfirmMismatch: false });
}

export function submitSignUpForm(name, email, password) {
  return (dispatch, getState) => {
    const {
      formValidationNameEmpty,
      formValidationEmailEmpty,
      formValidationEmailInvalid,
      formValidationEmailOccupied,
      formValidationPasswordEmpty,
      formValidationPasswordShort,
      formValidationPasswordConfirmMismatch
    } = getState().home;
    if (formValidationNameEmpty ||
        formValidationEmailEmpty || formValidationEmailInvalid || formValidationEmailOccupied ||
        formValidationPasswordEmpty || formValidationPasswordShort ||
        formValidationPasswordConfirmMismatch) {
      return;
    }
    dispatch(updateFormValidations({ serverError: false }));
    dispatch(updateFormSubmitting(true));
    fetch('/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }).then(function () {
      window.location = '/notes';
    }).catch(function (err) {
      dispatch(updateFormSubmitting(false));
      if (err.response.status === 400 || err.response.status === 409) {
        err.response.json().then(function (json) {
          dispatch(updateFormValidations(json));
        });
      } else {
        console.error(err);
        dispatch(updateFormValidations({ serverError: true }));
      }
    });
  };
}

export function submitSignInEmail(email) {
  return (dispatch, getState) => {
    const { formValidationEmailEmpty, formValidationEmailInvalid } = getState().home;
    if (formValidationEmailEmpty || formValidationEmailInvalid) {
      return;
    }
    dispatch(updateFormValidations({ serverError: false }));
    dispatch(updateFormSubmitting(true));
    getUserInformation(email).then(function (userInfo) {
      dispatch(updateFormSubmitting(false));
      if (userInfo) {
        dispatch(editFormName(userInfo.name));
        dispatch(updateSignInFormStep(1));
      } else {
        dispatch(updateFormValidations({ formValidationEmailNotExist: true }));
      }
    }, function (err) {
      dispatch(updateFormSubmitting(false));
      console.error(err);
      dispatch(updateFormValidations({ serverError: true }));
    });
  };
}

export function submitSignInForm(email, password) {
  return (dispatch, getState) => {
    const { formValidationPasswordEmpty } = getState().home;
    if (formValidationPasswordEmpty) {
      return;
    }
    dispatch(updateFormValidations({
      serverError: false,
      formValidationCredentialInvalid: false
    }));
    dispatch(updateFormSubmitting(true));
    fetch('/signin', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.trim(), password }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }).then(function () {
      window.location = '/notes';
    }).catch(function (err) {
      dispatch(updateFormSubmitting(false));
      if (err.response.status === 400 || err.response.status === 403) {
        err.response.json().then(function (json) {
          dispatch(updateFormValidations(json));
        });
      } else {
        console.error(err);
        dispatch(updateFormValidations({ serverError: true }));
      }
    });
  };
}

