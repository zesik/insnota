import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SignInForm from '../components/SignInForm';
import {
  resetForm,
  editFormEmail,
  editFormPassword,
  validateFormSignInEmail,
  validateFormSignInPassword,
  resetFormEmailValidation,
  resetFormPasswordValidation,
  updateSignInFormStep,
  submitSignInEmail,
  submitSignInForm
} from '../actions/home';

class SignIn extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(resetForm());
  }

  render() {
    const {
      formSubmitting,
      formStep,
      name,
      email,
      password,
      validationEmailEmpty,
      validationEmailInvalid,
      validationEmailNotExist,
      validationPasswordEmpty,
      validationCredentialInvalid,
      serverError,
      dispatch
    } = this.props;
    return (
      <div className="signin-form">
        <h1>Sign in</h1>
        <SignInForm
          formSubmitting={formSubmitting}
          formStep={formStep}
          name={name}
          email={email}
          password={password}
          validationEmailEmpty={validationEmailEmpty}
          validationEmailInvalid={validationEmailInvalid}
          validationEmailNotExist={validationEmailNotExist}
          validationPasswordEmpty={validationPasswordEmpty}
          validationCredentialInvalid={validationCredentialInvalid}
          serverError={serverError}
          onEnterEmailBox={() => dispatch(resetFormEmailValidation())}
          onLeaveEmailBox={emailValue => dispatch(validateFormSignInEmail(emailValue))}
          onEditEmail={emailValue => {
            dispatch(resetFormEmailValidation());
            dispatch(editFormEmail(emailValue));
          }}
          onEnterPasswordBox={() => dispatch(resetFormPasswordValidation())}
          onLeavePasswordBox={passwordValue => dispatch(validateFormSignInPassword(passwordValue))}
          onEditPassword={passwordValue => {
            dispatch(resetFormPasswordValidation());
            dispatch(editFormPassword(passwordValue));
          }}
          onSubmitEmail={emailValue => {
            dispatch(validateFormSignInEmail(emailValue));
            dispatch(submitSignInEmail(emailValue));
          }}
          onSubmit={(emailValue, passwordValue) => {
            dispatch(validateFormSignInPassword(passwordValue));
            dispatch(submitSignInForm(emailValue, passwordValue));
          }}
          onGoBackToEmail={() => dispatch(updateSignInFormStep(0))}
        />
        <div className="form-footer">
          <Link to="/signup">Create an Account</Link>
        </div>
      </div>
    );
  }
}

SignIn.propTypes = {
  formSubmitting: React.PropTypes.bool,
  formStep: React.PropTypes.number,
  name: React.PropTypes.string,
  email: React.PropTypes.string,
  password: React.PropTypes.string,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationEmailNotExist: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationCredentialInvalid: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func
};

const mapStateToProps = state => ({
  formSubmitting: state.home.formSubmitting,
  formStep: state.home.formSignInStep,
  name: state.home.formName,
  email: state.home.formEmail,
  password: state.home.formPassword,
  validationEmailEmpty: state.home.formValidationEmailEmpty,
  validationEmailInvalid: state.home.formValidationEmailInvalid,
  validationEmailNotExist: state.home.formValidationEmailNotExist,
  validationPasswordEmpty: state.home.formValidationPasswordEmpty,
  validationCredentialInvalid: state.home.formValidationCredentialInvalid,
  serverError: state.home.serverError
});

export default connect(mapStateToProps)(SignIn);
