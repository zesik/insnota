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
      validationPasswordMismatch,
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
          validationPasswordMismatch={validationPasswordMismatch}
          serverError={serverError}
          onEnterNameBox={() => dispatch(resetFormNameValidation())}
          onLeaveNameBox={(name) => dispatch(validateFormName(name))}
          onEditName={(name) => {
            dispatch(resetFormNameValidation());
            dispatch(editFormName(name));
          }}
          onEnterEmailBox={() => dispatch(resetFormEmailValidation())}
          onLeaveEmailBox={(email) => dispatch(validateFormSignUpEmail(email))}
          onEditEmail={(email) => {
            dispatch(resetFormEmailValidation());
            dispatch(editFormEmail(email));
          }}
          onEnterPasswordBox={() => dispatch(resetFormPasswordValidation())}
          onLeavePasswordBox={(password) => dispatch(validateFormSignUpPassword(password))}
          onEditPassword={(password) => {
            dispatch(resetFormPasswordValidation());
            dispatch(editFormPassword(password));
          }}
          onEnterPasswordConfirmBox={() => dispatch(resetFormPasswordConfirmValidation())}
          onLeavePasswordConfirmBox={(pwdConfirm) => dispatch(validateFormPasswordConfirm(password, pwdConfirm))}
          onEditPasswordConfirm={(passwordConfirm) => {
            dispatch(resetFormPasswordConfirmValidation());
            dispatch(editFormPasswordConfirm(passwordConfirm));
          }}
          onSubmit={(name, email, password, passwordConfirm) => {
            dispatch(validateFormName(name));
            dispatch(validateFormSignUpEmail(email));
            dispatch(validateFormSignUpPassword(password));
            dispatch(validateFormPasswordConfirm(password, passwordConfirm));
            dispatch(submitSignUpForm(name, email, password));
          }}
        />
        <div className="form-footer">
          <Link to="/signin">Sign in</Link>
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
  validationPasswordMismatch: React.PropTypes.bool,
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
  validationPasswordMismatch: state.home.formValidationPasswordMismatch,
  serverError: state.home.serverError
});

export default connect(mapStateToProps)(SignUp);
