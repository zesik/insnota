import 'whatwg-fetch';

export const INITIALIZE_SETTINGS_PAGE = 'INITIALIZE_SETTINGS_PAGE';
export const SET_SETTINGS_PROFILE_NAME = 'SET_SETTINGS_PROFILE_NAME';
export const SET_SETTINGS_OLD_PASSWORD = 'SET_SETTINGS_OLD_PASSWORD';
export const SET_SETTINGS_NEW_PASSWORD = 'SET_SETTINGS_NEW_PASSWORD';
export const SET_SETTINGS_PASSWORD_CONFIRMATION = 'SET_SETTINGS_PASSWORD_CONFIRMATION';
export const START_SUBMITTING_SETTINGS = 'START_SUBMITTING_SETTINGS';
export const FINISH_SUBMITTING_SETTINGS = 'FINISH_SUBMITTING_SETTINGS';

function initializeIdentity(name, email, status) {
  return {
    type: INITIALIZE_SETTINGS_PAGE,
    name,
    email,
    status
  };
}

export function initializeSettingsPage() {
  return dispatch => {
    fetch('/api/profile', {
      credentials: 'same-origin'
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function (json) {
      if (json.email) {
        dispatch(initializeIdentity(json.name, json.email, json.status));
      } else {
        window.location = '/';
      }
    })
    .catch(function (err) {
      window.location = '/';
      console.error(err);
    });
  };
}

export function setProfileName(name) {
  return {
    type: SET_SETTINGS_PROFILE_NAME,
    name
  };
}

export function setOldPassword(oldPassword) {
  return {
    type: SET_SETTINGS_OLD_PASSWORD,
    oldPassword
  };
}

export function setNewPassword(newPassword) {
  return {
    type: SET_SETTINGS_NEW_PASSWORD,
    newPassword
  };
}

export function setPasswordConfirmation(passwordConfirmation) {
  return {
    type: SET_SETTINGS_PASSWORD_CONFIRMATION,
    passwordConfirmation
  };
}

function startSubmitting() {
  return {
    type: START_SUBMITTING_SETTINGS
  };
}

function finishSubmitting(errors) {
  return {
    type: FINISH_SUBMITTING_SETTINGS,
    errors
  };
}

export function updateProfile(name) {
  return dispatch => {
    dispatch(startSubmitting());
    fetch('/api/settings/profile', {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name }),
      credentials: 'same-origin'
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function () {
      dispatch(finishSubmitting({ successProfile: true }));
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishSubmitting({ serverErrorProfile: true }));
        return;
      }
      err.response.json().then(function (json) {
        dispatch(finishSubmitting(json));
      });
    });
  };
}

export function updatePassword(oldPassword, newPassword, passwordConfirmation) {
  return dispatch => {
    dispatch(startSubmitting());
    const errors = {};
    if (newPassword.length === 0) {
      errors.errorNewPasswordEmpty = true;
    }
    if (newPassword !== passwordConfirmation) {
      errors.errorPasswordConfirmationMismatch = true;
    }
    if (Object.keys(errors).length > 0) {
      dispatch(finishSubmitting(errors));
      return;
    }
    fetch('/api/settings/password', {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ oldPassword, newPassword }),
      credentials: 'same-origin'
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function () {
      // FIXME: Undesired coupling with state
      dispatch(finishSubmitting({
        oldPassword: '',
        newPassword: '',
        passwordConfirmation: '',
        successPassword: true
      }));
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishSubmitting({ serverErrorPassword: true }));
        return;
      }
      err.response.json().then(function (json) {
        dispatch(finishSubmitting(json));
      });
    });
  }
}
