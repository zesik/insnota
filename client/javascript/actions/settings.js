import 'whatwg-fetch';

export const INITIALIZE_SETTINGS_PAGE = 'INITIALIZE_SETTINGS_PAGE';
export const SET_PROFILE_NAME = 'SET_PROFILE_NAME';
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
    type: SET_PROFILE_NAME,
    name
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
    fetch('/api/profile', {
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
        dispatch(finishSubmitting({ errorServer: true }));
        return;
      }
      err.response.json().then(function (json) {
        dispatch(finishSubmitting(json));
      });
    });
  };
}
