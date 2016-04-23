import {
  UPDATE_VISITOR_IDENTITY,
  RESET_FORM,
  UPDATE_FORM_STATUS,
  EDIT_FORM_NAME,
  EDIT_FORM_EMAIL,
  EDIT_FORM_PASSWORD,
  EDIT_FORM_PASSWORD_CONFIRM
} from '../actions/home';

const initialState = {
  checkingVisitorIdentity: false,
  visitorIdentity: null,
  serverError: false,
  formName: '',
  formEmail: '',
  formPassword: '',
  formPasswordConfirm: '',
  formSubmitting: false,
  formValidatingEmail: false,
  formValidationNameEmpty: false,
  formValidationEmailEmpty: false,
  formValidationEmailInvalid: false,
  formValidationEmailOccupied: false,
  formValidationPasswordEmpty: false,
  formValidationPasswordShort: false,
  formValidationPasswordMismatch: false,
  formValidationCredentialInvalid: false
};

function homeReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_VISITOR_IDENTITY:
      return Object.assign({}, state, {
        checkingVisitorIdentity: action.checkingVisitorIdentity,
        visitorIdentity: action.visitorIdentity
      });
    case RESET_FORM:
      return Object.assign({}, initialState, {
        checkingVisitorIdentity: state.checkingVisitorIdentity,
        visitorIdentity: state.visitorIdentity,
        formName: state.formName,
        formEmail: state.formEmail
      });
    case UPDATE_FORM_STATUS:
      return Object.assign({}, state, {
        formSubmitting: action.formSubmitting
      }, action.validations);
    case EDIT_FORM_NAME:
      return Object.assign({}, state, {
        formName: action.formName
      });
    case EDIT_FORM_EMAIL:
      return Object.assign({}, state, {
        formEmail: action.formEmail
      });
    case EDIT_FORM_PASSWORD:
      return Object.assign({}, state, {
        formPassword: action.formPassword
      });
    case EDIT_FORM_PASSWORD_CONFIRM:
      return Object.assign({}, state, {
        formPasswordConfirm: action.formPasswordConfirm
      });
    default:
      return state;
  }
}

export default homeReducer;
