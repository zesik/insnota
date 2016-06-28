import {
  FINISH_INITIALIZING_SIGN_IN_FORM,
  FINISH_INITIALIZING_SIGN_UP_FORM,
  SET_FORM_STAGE,
  EDIT_FORM_NAME,
  EDIT_FORM_EMAIL,
  EDIT_FORM_PASSWORD,
  EDIT_FORM_PASSWORD_CONFIRMATION,
  EDIT_FORM_REMEMBER_ME,
  RESET_RECAPTCHA,
  START_SUBMITTING_ACCOUNT_FORM,
  FINISH_SUBMITTING_ACCOUNT_FORM
} from '../actions/account';
import { FORM_STAGE_SIGN_IN_EMAIL } from '../components/SignInForm';
import { FORM_STAGE_SIGN_UP_FORBIDDEN, FORM_STAGE_SIGN_UP_READY } from '../components/SignUpForm';

const initialNoticeState = {
  errorNotAllowed: false,
  errorNameEmpty: false,
  errorEmailEmpty: false,
  errorEmailInvalid: false,
  errorEmailNotExist: false,
  errorEmailOccupied: false,
  errorPasswordEmpty: false,
  errorPasswordShort: false,
  errorPasswordConfirmMismatch: false,
  errorRecaptchaInvalid: false,
  errorCredentialInvalid: false,
  serverError: false
};

const initialState = Object.assign({
  loading: true,
  stage: '',
  recaptchaSiteKey: '',
  name: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  rememberMe: false
}, initialNoticeState);

function accountReducer(state = initialState, action) {
  switch (action.type) {
    case FINISH_INITIALIZING_SIGN_IN_FORM:
      return Object.assign({}, initialState, {
        loading: false,
        stage: FORM_STAGE_SIGN_IN_EMAIL
      });
    case FINISH_INITIALIZING_SIGN_UP_FORM:
      if (action.serverError) {
        return Object.assign({}, initialState, {
          serverError: true
        });
      }
      if (action.forbidden) {
        return Object.assign({}, initialState, {
          stage: FORM_STAGE_SIGN_UP_FORBIDDEN,
          errorNotAllowed: true
        });
      }
      return Object.assign({}, initialState, {
        loading: false,
        stage: FORM_STAGE_SIGN_UP_READY,
        recaptchaSiteKey: action.recaptcha
      });
    case SET_FORM_STAGE:
      return Object.assign({}, state, {
        stage: action.stage
      });
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
    case EDIT_FORM_PASSWORD_CONFIRMATION:
      return Object.assign({}, state, {
        passwordConfirmation: action.passwordConfirmation
      });
    case EDIT_FORM_REMEMBER_ME:
      return Object.assign({}, state, {
        rememberMe: action.rememberMe
      });
    case RESET_RECAPTCHA:
      return Object.assign({}, state, {
        recaptchaSiteKey: ''
      });
    case START_SUBMITTING_ACCOUNT_FORM:
      return Object.assign({}, state, {
        loading: true
      }, initialNoticeState);
    case FINISH_SUBMITTING_ACCOUNT_FORM:
      return Object.assign({}, state, {
        loading: false
      }, action.errors);
    default:
      return state;
  }
}

export default accountReducer;
