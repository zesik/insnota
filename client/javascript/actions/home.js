import 'whatwg-fetch';

export const EDIT_NAME = 'EDIT_NAME';
export const EDIT_EMAIL = 'EDIT_EMAIL';
export const EDIT_PASSWORD = 'EDIT_PASSWORD';
export const EDIT_PASSWORD_CONFIRM = 'EDIT_PASSWORD_CONFIRM';
export const FINISH_EDIT_NAME = 'FINISH_EDIT_NAME';
export const FINISH_EDIT_EMAIL = 'FINISH_EDIT_EMAIL';
export const FINISH_EDIT_PASSWORD = 'FINISH_EDIT_PASSWORD';
export const FINISH_EDIT_PASSWORD_CONFIRM = 'FINISH_EDIT_PASSWORD_CONFIRM';
export const CLEAN_UP_FORM = 'CLEAN_UP_FORM';
export const CHANGE_REQUEST_STATUS = 'CHANGE_REQUEST_STATUS';

export function editName(name) {
  return { type: EDIT_NAME, name };
}

export function editEmail(email) {
  return { type: EDIT_EMAIL, email };
}

export function editPassword(password) {
  return { type: EDIT_PASSWORD, password };
}

export function editPasswordConfirm(passwordConfirm) {
  return { type: EDIT_PASSWORD_CONFIRM, passwordConfirm };
}

export function finishEditName(name) {
  return { type: FINISH_EDIT_NAME, name };
}

export function finishEditEmail(email) {
  return { type: FINISH_EDIT_EMAIL, email };
}

export function finishEditPassword(password) {
  return { type: FINISH_EDIT_PASSWORD, password };
}

export function finishEditPasswordConfirm(passwordConfirm) {
  return { type: FINISH_EDIT_PASSWORD_CONFIRM, passwordConfirm };
}

export function cleanupForm() {
  return { type: CLEAN_UP_FORM };
}

export function signUp(name, email, password) {
  return dispatch => {
    changeRequestStatus(true, []);
    fetch('/signup', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }).then(function () {
      window.location = '/notes';
    }).catch(function (err) {
      if (err.response.status >= 400 && err.response.status < 500) {
        err.response.json().then(function (json) {
          dispatch(changeRequestStatus(false, json));
        });
      } else {
        dispatch(changeRequestStatus(false, { serverError: true }));
      }
    });
  };
}

export function signIn(email, password) {
  return dispatch => {
    changeRequestStatus(true, []);
    fetch('/signin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }).then(function () {
      window.location = '/notes';
    }).catch(function (err) {
      if (err.response.status >= 400 && err.response.status < 500) {
        err.response.json().then(function (json) {
          dispatch(changeRequestStatus(false, json));
        });
      } else {
        dispatch(changeRequestStatus(false, { serverError: true }));
      }
    });
  };
}

function changeRequestStatus(loading, errors) {
  return { type: CHANGE_REQUEST_STATUS, loading, errors };
}
