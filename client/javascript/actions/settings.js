import 'whatwg-fetch';

export const INITIALIZE_SETTINGS_PAGE = 'INITIALIZE_SETTINGS_PAGE';
export const EDIT_SETTINGS_PROFILE_NAME = 'EDIT_SETTINGS_PROFILE_NAME';
export const EDIT_SETTINGS_OLD_PASSWORD = 'EDIT_SETTINGS_OLD_PASSWORD';
export const EDIT_SETTINGS_NEW_PASSWORD = 'EDIT_SETTINGS_NEW_PASSWORD';
export const EDIT_SETTINGS_PASSWORD_CONFIRMATION = 'EDIT_SETTINGS_PASSWORD_CONFIRMATION';
export const START_SUBMITTING_SETTINGS = 'START_SUBMITTING_SETTINGS';
export const FINISH_SUBMITTING_SETTINGS = 'FINISH_SUBMITTING_SETTINGS';
export const RESET_SETTINGS_RECAPTCHA = 'RESET_SETTINGS_RECAPTCHA';

function initializeIdentity(name, email, status, recaptcha) {
  return {
    type: INITIALIZE_SETTINGS_PAGE,
    name,
    email,
    status,
    recaptchaSiteKey: recaptcha
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
        dispatch(initializeIdentity(json.name, json.email, json.status, json.recaptcha));
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

export function editProfileName(name) {
  return {
    type: EDIT_SETTINGS_PROFILE_NAME,
    name
  };
}

export function editOldPassword(oldPassword) {
  return {
    type: EDIT_SETTINGS_OLD_PASSWORD,
    oldPassword
  };
}

export function editNewPassword(newPassword) {
  return {
    type: EDIT_SETTINGS_NEW_PASSWORD,
    newPassword
  };
}

export function editPasswordConfirmation(passwordConfirmation) {
  return {
    type: EDIT_SETTINGS_PASSWORD_CONFIRMATION,
    passwordConfirmation
  };
}

function startSubmittingSettings() {
  return {
    type: START_SUBMITTING_SETTINGS
  };
}

function finishSubmittingSettings(errors) {
  return {
    type: FINISH_SUBMITTING_SETTINGS,
    errors
  };
}

export function resetRecaptcha() {
  return {
    type: RESET_SETTINGS_RECAPTCHA
  };
}

export function updateProfile(name) {
  return dispatch => {
    dispatch(startSubmittingSettings());
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
      dispatch(finishSubmittingSettings({ successProfile: true }));
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishSubmittingSettings({ serverErrorProfile: true }));
        return;
      }
      err.response.json().then(function (json) {
        dispatch(finishSubmittingSettings(json));
      });
    });
  };
}

export function updatePassword(oldPassword, newPassword, passwordConfirmation, recaptcha) {
  return dispatch => {
    dispatch(startSubmittingSettings());
    const errors = {};
    if (newPassword.length === 0) {
      errors.errorNewPasswordEmpty = true;
    } else if (newPassword.length < 6) {
      errors.errorNewPasswordShort = true;
    }
    if (newPassword !== passwordConfirmation) {
      errors.errorPasswordConfirmationMismatch = true;
    }
    if (Object.keys(errors).length > 0) {
      dispatch(finishSubmittingSettings(errors));
      return;
    }
    fetch('/api/settings/password', {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ oldPassword, newPassword, recaptcha }),
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
      dispatch(finishSubmittingSettings({
        oldPassword: '',
        newPassword: '',
        passwordConfirmation: '',
        successPassword: true
      }));
    })
    .catch(function (err) {
      dispatch(resetRecaptcha());
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishSubmittingSettings({ serverErrorPassword: true }));
        return;
      }
      err.response.json().then(function (json) {
        dispatch(finishSubmittingSettings(json));
      });
    });
  };
}
