import 'whatwg-fetch';
import { FORM_STAGE_SIGN_IN_PASSWORD } from '../components/SignInForm';

export const FINISH_INITIALIZING_SIGN_IN_FORM = 'FINISH_INITIALIZING_SIGN_IN_FORM';
export const FINISH_INITIALIZING_SIGN_UP_FORM = 'FINISH_INITIALIZING_SIGN_UP_FORM';
export const SET_FORM_STAGE = 'SET_FORM_STAGE';
export const EDIT_FORM_NAME = 'EDIT_FORM_NAME';
export const EDIT_FORM_EMAIL = 'EDIT_FORM_EMAIL';
export const EDIT_FORM_PASSWORD = 'EDIT_FORM_PASSWORD';
export const EDIT_FORM_PASSWORD_CONFIRMATION = 'EDIT_FORM_PASSWORD_CONFIRMATION';
export const EDIT_FORM_REMEMBER_ME = 'EDIT_FORM_REMEMBER_ME';
export const RESET_FORM_RECAPTCHA = 'RESET_FORM_RECAPTCHA';
export const START_SUBMITTING_ACCOUNT_FORM = 'START_SUBMITTING_ACCOUNT_FORM';
export const FINISH_SUBMITTING_ACCOUNT_FORM = 'FINISH_SUBMITTING_ACCOUNT_FORM';

function getSignInResponse(email) {
  return fetch(`/api/signin/${email}`, { credentials: 'same-origin' })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(response.statusText);
    });
}

function getSignUpResponse() {
  return fetch('/api/signup', { credentials: 'same-origin' })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      if (response.status === 403) {
        return { forbidden: true };
      }
      throw new Error(response.statusText);
    });
}

function resetRecaptcha() {
  return {
    type: RESET_FORM_RECAPTCHA
  };
}

function setFormStage(stage) {
  return {
    type: SET_FORM_STAGE,
    stage
  };
}

export function editName(name) {
  return {
    type: EDIT_FORM_NAME,
    name
  };
}

export function editEmail(email) {
  return {
    type: EDIT_FORM_EMAIL,
    email
  };
}

export function editPassword(password) {
  return {
    type: EDIT_FORM_PASSWORD,
    password
  };
}

export function editPasswordConfirmation(passwordConfirmation) {
  return {
    type: EDIT_FORM_PASSWORD_CONFIRMATION,
    passwordConfirmation
  };
}

export function editRememberMe(rememberMe) {
  return {
    type: EDIT_FORM_REMEMBER_ME,
    rememberMe
  };
}

function finishInitializingSignInForm() {
  return {
    type: FINISH_INITIALIZING_SIGN_IN_FORM
  };
}

export function initializeSignInForm() {
  return dispatch => {
    dispatch(finishInitializingSignInForm());
  };
}

function finishInitializingSignUpForm(serverError, forbidden, recaptcha) {
  return {
    type: FINISH_INITIALIZING_SIGN_UP_FORM,
    serverError,
    forbidden,
    recaptcha
  };
}

export function initializeSignUpForm() {
  return dispatch => {
    getSignUpResponse()
      .then(response => dispatch(finishInitializingSignUpForm(false, response.forbidden, response.recaptchaSiteKey)))
      .catch((err) => {
        console.error(err);
        dispatch(finishInitializingSignUpForm(true));
      });
  };
}

function startSubmittingAccountForm() {
  return {
    type: START_SUBMITTING_ACCOUNT_FORM
  };
}

function finishSubmittingAccount(errors) {
  return {
    type: FINISH_SUBMITTING_ACCOUNT_FORM,
    errors
  };
}

export function submitSignUpForm(name, email, password, passwordConfirmation, recaptcha) {
  return dispatch => {
    dispatch(startSubmittingAccountForm());
    const errors = {};
    if (name.trim().length === 0) {
      errors.errorNameEmpty = true;
    }
    if (email.trim().length === 0) {
      errors.ERROR_EMAIL_EMPTY = true;
    } else if (!/[^@]+@[^@]+/.test(email.trim())) {
      errors.errorEmailInvalid = true;
    }
    if (password.length === 0) {
      errors.errorPasswordEmpty = true;
    } else if (password.length < 6) {
      errors.errorPasswordShort = true;
    }
    if (password !== passwordConfirmation) {
      errors.errorPasswordConfirmationMismatch = true;
    }
    if (Object.keys(errors).length > 0) {
      dispatch(finishSubmittingAccount(errors));
      return;
    }
    fetch('/api/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password, recaptcha }),
      credentials: 'same-origin'
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return null;
      }
      if (response.status < 500) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((json) => {
      if (json) {
        dispatch(resetRecaptcha());
        dispatch(finishSubmittingAccount(json));
      } else {
        window.location = '/notes';
      }
    })
    .catch((err) => {
      console.error(err);
      dispatch(resetRecaptcha());
      dispatch(finishSubmittingAccount({ serverError: true }));
    });
  };
}

export function submitSignInEmail(email) {
  return dispatch => {
    dispatch(startSubmittingAccountForm());
    const errors = {};
    if (email.trim().length === 0) {
      errors.ERROR_EMAIL_EMPTY = true;
    } else if (!/[^@]+@[^@]+/.test(email.trim())) {
      errors.errorEmailInvalid = true;
    }
    if (Object.keys(errors).length > 0) {
      dispatch(finishSubmittingAccount(errors));
      return;
    }
    getSignInResponse(email)
      .then(function (userInfo) {
        if (userInfo) {
          dispatch(finishSubmittingAccount({ name: userInfo.name, recaptchaSiteKey: userInfo.recaptchaSiteKey }));
          dispatch(setFormStage(FORM_STAGE_SIGN_IN_PASSWORD));
        } else {
          dispatch(finishSubmittingAccount({ errorEmailNotExist: true }));
        }
      })
      .catch(function (err) {
        console.error(err);
        dispatch(finishSubmittingAccount({ serverError: true }));
      });
  };
}

export function submitSignInForm(email, password, remember, recaptcha) {
  return dispatch => {
    dispatch(startSubmittingAccountForm());
    const errors = {};
    if (password.length === 0) {
      errors.errorPasswordEmpty = true;
    }
    if (Object.keys(errors).length > 0) {
      dispatch(finishSubmittingAccount(errors));
      return;
    }
    fetch('/api/signin', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.trim(), password, remember, recaptcha }),
      credentials: 'same-origin'
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return null;
      }
      if (response.status < 500) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((json) => {
      if (json) {
        dispatch(resetRecaptcha());
        dispatch(finishSubmittingAccount(json));
      } else {
        window.location = '/notes';
      }
    })
    .catch((err) => {
      console.error(err);
      dispatch(resetRecaptcha());
      dispatch(finishSubmittingAccount({ serverError: true }));
    });
  };
}
