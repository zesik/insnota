import {
  INITIALIZE_SETTINGS_PAGE,
  SET_PROFILE_NAME
} from '../actions/settings';

const initialState = {
  loading: true,
  name: '',
  email: '',
  status: ''
};

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
    default:
      return state;
  }
}

export default settingsReducer;
