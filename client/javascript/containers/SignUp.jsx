import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SignUpForm from '../components/SignUpForm';
import {
  resetForm,
  editFormName,
  editFormEmail,
  editFormPassword,
  editFormPasswordConfirm,
  validateFormName,
  validateFormSignUpEmail,
  validateFormSignUpPassword,
  validateFormPasswordConfirm,
  resetFormNameValidation,
  resetFormEmailValidation,
  resetFormPasswordValidation,
  resetFormPasswordConfirmValidation,
  submitSignUpForm
} from '../actions/home';

class SignUp extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(resetForm());
  }

  render() {
    const {
      formSubmitting,
      name,
      email,
      password,
      passwordConfirm,
      validationNameEmpty,
      validatingEmail,
      validationEmailEmpty,
      validationEmailInvalid,
      validationEmailOccupied,
      validationPasswordEmpty,
      validationPasswordShort,
      validationPasswordConfirmMismatch,
      serverError,
      dispatch
    } = this.props;
    return (
      <div className="signup-form">
        <h1>Sign up</h1>
        <SignUpForm
          formSubmitting={formSubmitting}
          name={name}
          email={email}
          password={password}
          passwordConfirm={passwordConfirm}
          validationNameEmpty={validationNameEmpty}
          validatingEmail={validatingEmail}
          validationEmailEmpty={validationEmailEmpty}
          validationEmailInvalid={validationEmailInvalid}
          validationEmailOccupied={validationEmailOccupied}
          validationPasswordEmpty={validationPasswordEmpty}
          validationPasswordShort={validationPasswordShort}
          validationPasswordConfirmMismatch={validationPasswordConfirmMismatch}
          serverError={serverError}
          onEnterNameBox={() => dispatch(resetFormNameValidation())}
          onLeaveNameBox={nameValue => dispatch(validateFormName(nameValue))}
          onEditName={nameValue => {
            dispatch(resetFormNameValidation());
            dispatch(editFormName(nameValue));
          }}
          onEnterEmailBox={() => dispatch(resetFormEmailValidation())}
          onLeaveEmailBox={emailValue => dispatch(validateFormSignUpEmail(emailValue))}
          onEditEmail={emailValue => {
            dispatch(resetFormEmailValidation());
            dispatch(editFormEmail(emailValue));
          }}
          onEnterPasswordBox={() => dispatch(resetFormPasswordValidation())}
          onLeavePasswordBox={passwordValue => dispatch(validateFormSignUpPassword(passwordValue))}
          onEditPassword={passwordValue => {
            dispatch(resetFormPasswordValidation());
            dispatch(resetFormPasswordConfirmValidation());
            dispatch(editFormPassword(passwordValue));
          }}
          onEnterPasswordConfirmBox={() => dispatch(resetFormPasswordConfirmValidation())}
          onLeavePasswordConfirmBox={pwdConfirm => dispatch(validateFormPasswordConfirm(password, pwdConfirm))}
          onEditPasswordConfirm={pwdConfirm => {
            dispatch(resetFormPasswordConfirmValidation());
            dispatch(editFormPasswordConfirm(pwdConfirm));
          }}
          onSubmit={(nameValue, emailValue, passwordValue, pwdConfirm) => {
            dispatch(validateFormName(nameValue));
            dispatch(validateFormSignUpEmail(emailValue));
            dispatch(validateFormSignUpPassword(passwordValue));
            dispatch(validateFormPasswordConfirm(passwordValue, pwdConfirm));
            dispatch(submitSignUpForm(nameValue, emailValue, passwordValue));
          }}
        />
        <div className="form-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    );
  }
}

SignUp.propTypes = {
  formSubmitting: React.PropTypes.bool,
  name: React.PropTypes.string,
  email: React.PropTypes.string,
  password: React.PropTypes.string,
  passwordConfirm: React.PropTypes.string,
  validationNameEmpty: React.PropTypes.bool,
  validatingEmail: React.PropTypes.bool,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationEmailOccupied: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationPasswordShort: React.PropTypes.bool,
  validationPasswordConfirmMismatch: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func
};

const mapStateToProps = state => ({
  formSubmitting: state.home.formSubmitting,
  name: state.home.formName,
  email: state.home.formEmail,
  password: state.home.formPassword,
  passwordConfirm: state.home.formPasswordConfirm,
  validationNameEmpty: state.home.formValidationNameEmpty,
  validatingEmail: state.home.formValidatingEmail,
  validationEmailEmpty: state.home.formValidationEmailEmpty,
  validationEmailInvalid: state.home.formValidationEmailInvalid,
  validationEmailOccupied: state.home.formValidationEmailOccupied,
  validationPasswordEmpty: state.home.formValidationPasswordEmpty,
  validationPasswordShort: state.home.formValidationPasswordShort,
  validationPasswordConfirmMismatch: state.home.formValidationPasswordConfirmMismatch,
  serverError: state.home.serverError
});

export default connect(mapStateToProps)(SignUp);
