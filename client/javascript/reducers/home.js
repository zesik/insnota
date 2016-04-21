import {
  EDIT_NAME,
  EDIT_EMAIL,
  EDIT_PASSWORD,
  EDIT_PASSWORD_CONFIRM,
  CLEAN_UP_FORM,
  CHANGE_REQUEST_STATUS
} from '../actions/home';

const verifications = {
  nameEmpty: false,
  emailEmpty: false,
  emailInvalid: false,
  emailOccupied: false,
  passwordEmpty: false,
  passwordShort: false,
  passwordMismatch: false,
  credentialInvalid: false,
  serverError: false
};

const initialState = Object.assign({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  loading: false
}, verifications);

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case EDIT_NAME:
      return Object.assign({}, state, {
        name: action.name
      });
    case EDIT_EMAIL:
      return Object.assign({}, state, {
        email: action.email
      });
    case EDIT_PASSWORD:
      return Object.assign({}, state, {
        password: action.password
      });
    case EDIT_PASSWORD_CONFIRM:
      return Object.assign({}, state, {
        passwordConfirm: action.passwordConfirm
      });
    case CLEAN_UP_FORM:
      return Object.assign({}, state, verifications, {
        password: '',
        passwordConfirm: ''
      });
    case CHANGE_REQUEST_STATUS:
      return Object.assign({}, state, verifications, action.errors);
    default:
      return state;
  }
}

export default homeReducer;
