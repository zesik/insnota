import {
  INITIALIZE_SETTINGS_PAGE,
  SET_PROFILE_NAME,
  START_SUBMITTING_SETTINGS,
  FINISH_SUBMITTING_SETTINGS
} from '../actions/settings';

const initialNoticeState = {
  errorServer: false,
  errorNameEmpty: false,
  errorOldPasswordIncorrect: false,
  errorNewPasswordMismatch: false,
  errorNewPasswordShort: false,
  successProfile: false,
  successPassword: false,
};

const initialState = Object.assign({
  loading: true,
  name: '',
  email: '',
  status: ''
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
    case SET_PROFILE_NAME:
      return Object.assign({}, state, {
        name: action.name
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
