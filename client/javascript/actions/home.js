import 'whatwg-fetch';
import {
  validateName,
  validateEmail,
  validateSignInPassword,
  validateSignUpPassword,
  validatePasswordConfirm
} from '../utils/form';
import { FORM_STAGE_SIGN_IN_PASSWORD } from '../components/SignInForm';
import {
  FORM_STAGE_SIGN_UP_INITIALIZING,
  FORM_STAGE_SIGN_UP_FORBIDDEN,
  FORM_STAGE_SIGN_UP_READY
} from '../components/SignUpForm';

export const UPDATE_IDENTITY = 'UPDATE_IDENTITY';
export const RESET_FORM = 'RESET_FORM';
export const UPDATE_FORM_SUBMITTING = 'UPDATE_FORM_SUBMITTING';
export const UPDATE_FORM_VALIDATIONS = 'UPDATE_FORM_VALIDATIONS';
export const UPDATE_FORM_STAGE = 'UPDATE_FORM_STAGE';
export const EDIT_FORM_NAME = 'EDIT_FORM_NAME';
export const EDIT_FORM_EMAIL = 'EDIT_FORM_EMAIL';
export const EDIT_FORM_PASSWORD = 'EDIT_FORM_PASSWORD';
export const EDIT_FORM_PASSWORD_CONFIRM = 'EDIT_FORM_PASSWORD_CONFIRM';
export const EDIT_FORM_REMEMBER_ME = 'EDIT_FORM_REMEMBER_ME';

function getSignInResponse(email) {
  return new Promise(function (resolve, reject) {
    fetch(`/api/signin/${email}`, {
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

function getSignUpResponse() {
  return new Promise(function (resolve, reject) {
    fetch('/api/signup', {
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
      if (err.response.status === 403) {
        return resolve({ forbidden: true });
      }
      return reject(err);
    });
  });
}

function updateIdentity(checkingVisitorIdentity, visitorIdentity) {
  return { type: UPDATE_IDENTITY, checkingVisitorIdentity, visitorIdentity };
}

export function checkIdentity() {
  return dispatch => {
    dispatch(updateIdentity(true, null));
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
      dispatch(updateIdentity(false, json.email || null));
    }).catch(function (err) {
      dispatch(updateIdentity(false, null));
      console.error(err);
    });
  };
}

export function resetForm() {
  return { type: RESET_FORM };
}

export function updateFormSubmitting(submitting) {
  return { type: UPDATE_FORM_SUBMITTING, submitting };
}

export function updateFormValidations(validations) {
  return { type: UPDATE_FORM_VALIDATIONS, validations };
}

export function resetServerValidations() {
  return updateFormValidations({
    serverError: false,
    validationEmailOccupied: false,
    validationEmailNotExist: false,
    validationNotAllowed: false,
    validationCredentialInvalid: false,
    validationRecaptchaInvalid: false
  });
}

export function updateFormStage(stage) {
  return { type: UPDATE_FORM_STAGE, stage };
}

export function editFormName(name) {
  return { type: EDIT_FORM_NAME, name };
}

export function editFormEmail(email) {
  return { type: EDIT_FORM_EMAIL, email };
}

export function editFormPassword(password) {
  return { type: EDIT_FORM_PASSWORD, password };
}

export function editFormPasswordConfirm(passwordConfirm) {
  return { type: EDIT_FORM_PASSWORD_CONFIRM, passwordConfirm };
}

export function editFormRememberMe(rememberMe) {
  return { type: EDIT_FORM_REMEMBER_ME, rememberMe };
}

export function validateFormName(name) {
  return updateFormValidations(validateName(name));
}

export function resetFormNameValidation() {
  return updateFormValidations({
    validationNameEmpty: false
  });
}

export function validateFormSignInEmail(email) {
  return updateFormValidations(validateEmail(email));
}

export function validateFormSignUpEmail(email) {
  return (dispatch, getState) => {
    dispatch(updateFormValidations(validateEmail(email)));
    const { validationEmailEmpty, validationEmailInvalid } = getState().home;
    if (validationEmailEmpty || validationEmailInvalid) {
      return;
    }
  };
}

export function resetFormEmailValidation() {
  return updateFormValidations({
    validatingEmail: false,
    validationEmailEmpty: false,
    validationEmailInvalid: false,
    validationEmailOccupied: false,
    validationEmailNotExist: false
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
    validationPasswordEmpty: false,
    validationPasswordShort: false,
    validationCredentialInvalid: false
  });
}

export function resetFormPasswordConfirmValidation() {
  return updateFormValidations({
    validationPasswordConfirmMismatch: false
  });
}

export function initializeSignUpForm() {
  return (dispatch) => {
    dispatch(updateFormSubmitting(true));
    dispatch(resetServerValidations());
    dispatch(updateFormStage(FORM_STAGE_SIGN_UP_INITIALIZING));
    getSignUpResponse().then(function (signUpResponse) {
      dispatch(updateFormSubmitting(false));
      if (signUpResponse.forbidden) {
        dispatch(updateFormValidations({ validationNotAllowed: true }));
        dispatch(updateFormStage(FORM_STAGE_SIGN_UP_FORBIDDEN));
        return;
      }
      dispatch(updateFormValidations({ recaptchaSiteKey: signUpResponse.recaptcha }));
      dispatch(updateFormStage(FORM_STAGE_SIGN_UP_READY));
    }, function (err) {
      dispatch(updateFormSubmitting(false));
      console.error(err);
      dispatch(updateFormValidations({ serverError: true }));
    });
  };
}

export function submitSignUpForm(name, email, password, recaptcha) {
  return (dispatch, getState) => {
    const {
      validationNameEmpty,
      validationEmailEmpty,
      validationEmailInvalid,
      validationEmailOccupied,
      validationPasswordEmpty,
      validationPasswordShort,
      validationPasswordConfirmMismatch
    } = getState().home;
    if (validationNameEmpty ||
        validationEmailEmpty || validationEmailInvalid || validationEmailOccupied ||
        validationPasswordEmpty || validationPasswordShort ||
        validationPasswordConfirmMismatch) {
      return;
    }
    dispatch(updateFormSubmitting(true));
    dispatch(resetServerValidations());
    fetch('/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password, recaptcha }),
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
      dispatch(updateFormValidations({ recaptchaSiteKey: '' }));
      if (err.response.status === 400 || err.response.status === 403 || err.response.status === 409) {
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
    const { validationEmailEmpty, validationEmailInvalid } = getState().home;
    if (validationEmailEmpty || validationEmailInvalid) {
      return;
    }
    dispatch(updateFormSubmitting(true));
    dispatch(resetServerValidations());
    getSignInResponse(email).then(function (userInfo) {
      dispatch(updateFormSubmitting(false));
      dispatch(updateFormValidations({ recaptchaSiteKey: '' }));
      if (userInfo) {
        dispatch(updateFormValidations({ recaptchaSiteKey: userInfo.recaptcha }));
        dispatch(editFormName(userInfo.name));
        dispatch(updateFormStage(FORM_STAGE_SIGN_IN_PASSWORD));
      } else {
        dispatch(updateFormValidations({ validationEmailNotExist: true }));
      }
    }, function (err) {
      dispatch(updateFormSubmitting(false));
      console.error(err);
      dispatch(updateFormValidations({ serverError: true }));
    });
  };
}

export function submitSignInForm(email, password, remember, recaptcha) {
  return (dispatch, getState) => {
    const { validationPasswordEmpty } = getState().home;
    if (validationPasswordEmpty) {
      return;
    }
    dispatch(updateFormSubmitting(true));
    dispatch(resetServerValidations());
    fetch('/signin', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.trim(), password, remember, recaptcha }),
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
      dispatch(updateFormValidations({ recaptchaSiteKey: '' }));
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

