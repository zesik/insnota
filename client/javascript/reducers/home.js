import {
  UPDATE_IDENTITY,
  RESET_FORM,
  UPDATE_FORM_SUBMITTING,
  UPDATE_FORM_VALIDATIONS,
  UPDATE_FORM_STAGE,
  EDIT_FORM_NAME,
  EDIT_FORM_EMAIL,
  EDIT_FORM_PASSWORD,
  EDIT_FORM_PASSWORD_CONFIRM,
  EDIT_FORM_REMEMBER_ME
} from '../actions/home';

const initialState = {
  checkingIdentity: false,
  identity: null,
  stage: '',
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  rememberMe: false,
  recaptchaSiteKey: '',
  submitting: false,
  serverError: false,
  validatingEmail: false,
  validationNameEmpty: false,
  validationEmailEmpty: false,
  validationEmailInvalid: false,
  validationEmailNotExist: false,
  validationEmailOccupied: false,
  validationPasswordEmpty: false,
  validationPasswordShort: false,
  validationPasswordConfirmMismatch: false,
  validationRecaptchaInvalid: false,
  validationCredentialInvalid: false,
  validationNotAllowed: false
};

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_IDENTITY:
      return Object.assign({}, state, {
        checkingIdentity: action.checkingIdentity,
        identity: action.identity
      });
    case UPDATE_FORM_STAGE:
      return Object.assign({}, state, {
        stage: action.stage
      });
    case RESET_FORM:
      return Object.assign({}, initialState, {
        checkingIdentity: state.checkingIdentity,
        identity: state.identity,
        stage: state.stage
      });
    case UPDATE_FORM_SUBMITTING:
      return Object.assign({}, state, {
        submitting: action.submitting
      });
    case UPDATE_FORM_VALIDATIONS:
      return Object.assign({}, state, action.validations);
    case EDIT_FORM_NAME:
      return Object.assign({}, state, {
        name: action.name
      });
    case EDIT_FORM_EMAIL:
      return Object.assign({}, state, {
        email: action.email
      });
    case EDIT_FORM_PASSWORD:
      return Object.assign({}, state, {
        password: action.password
      });
    case EDIT_FORM_PASSWORD_CONFIRM:
      return Object.assign({}, state, {
        passwordConfirm: action.passwordConfirm
      });
    case EDIT_FORM_REMEMBER_ME:
      return Object.assign({}, state, {
        rememberMe: action.rememberMe
      });
    default:
      return state;
  }
}

export default homeReducer;
