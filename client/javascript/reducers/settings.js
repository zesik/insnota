import {
  INITIALIZE_SETTINGS_PAGE,
  EDIT_SETTINGS_PROFILE_NAME,
  EDIT_SETTINGS_OLD_PASSWORD,
  EDIT_SETTINGS_NEW_PASSWORD,
  EDIT_SETTINGS_PASSWORD_CONFIRMATION,
  START_SUBMITTING_SETTINGS,
  FINISH_SUBMITTING_SETTINGS
} from '../actions/settings';

const initialNoticeState = {
  errorNameEmpty: false,
  errorOldPasswordIncorrect: false,
  errorNewPasswordEmpty: false,
  errorNewPasswordShort: false,
  errorPasswordConfirmationMismatch: false,
  successProfile: false,
  successPassword: false,
  serverErrorProfile: false,
  serverErrorPassword: false
};

const initialState = Object.assign({
  loading: true,
  name: '',
  email: '',
  status: '',
  oldPassword: '',
  newPassword: '',
  passwordConfirmation: ''
}, initialNoticeState);

function settingsReducer(state = initialState, action) {
  switch (action.type) {
    case INITIALIZE_SETTINGS_PAGE:
      return Object.assign({}, state, {
        loading: false,
        name: action.name,
        email: action.email,
        status: action.status
      });
    case EDIT_SETTINGS_PROFILE_NAME:
      return Object.assign({}, state, {
        name: action.name
      });
    case EDIT_SETTINGS_OLD_PASSWORD:
      return Object.assign({}, state, {
        oldPassword: action.oldPassword
      });
    case EDIT_SETTINGS_NEW_PASSWORD:
      return Object.assign({}, state, {
        newPassword: action.newPassword
      });
    case EDIT_SETTINGS_PASSWORD_CONFIRMATION:
      return Object.assign({}, state, {
        passwordConfirmation: action.passwordConfirmation
      });
    case START_SUBMITTING_SETTINGS:
      return Object.assign({}, state, {
        loading: true
      }, initialNoticeState);
    case FINISH_SUBMITTING_SETTINGS:
      return Object.assign({}, state, {
        loading: false
      }, action.errors);
    default:
      return state;
  }
}

export default settingsReducer;
