import {
  UPDATE_VISITOR_IDENTITY,
  RESET_FORM,
  UPDATE_FORM_SUBMITTING,
  UPDATE_FORM_VALIDATIONS,
  UPDATE_SIGNIN_FORM_STEP,
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
  formRemember: true,
  formSignInStep: 0,
  formSubmitting: false,
  formValidatingEmail: false,
  formValidationNameEmpty: false,
  formValidationEmailEmpty: false,
  formValidationEmailInvalid: false,
  formValidationEmailNotExist: false,
  formValidationEmailOccupied: false,
  formValidationPasswordEmpty: false,
  formValidationPasswordShort: false,
  formValidationPasswordConfirmMismatch: false,
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
        visitorIdentity: state.visitorIdentity
      });
    case UPDATE_FORM_SUBMITTING:
      return Object.assign({}, state, {
        formSubmitting: action.formSubmitting
      });
    case UPDATE_FORM_VALIDATIONS:
      return Object.assign({}, state, action.validations);
    case UPDATE_SIGNIN_FORM_STEP:
      return Object.assign({}, state, {
        formSignInStep: action.step
      });
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
