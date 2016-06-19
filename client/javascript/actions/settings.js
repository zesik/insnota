import 'whatwg-fetch';

export const INITIALIZE_SETTINGS_PAGE = 'INITIALIZE_SETTINGS_PAGE';
export const SET_PROFILE_NAME = 'SET_PROFILE_NAME';

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
    fetch('/api/user', {
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
