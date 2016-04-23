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
      email,
      password,
      validationEmailEmpty,
      validationEmailInvalid,
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
          email={email}
          password={password}
          validationEmailEmpty={validationEmailEmpty}
          validationEmailInvalid={validationEmailInvalid}
          validationPasswordEmpty={validationPasswordEmpty}
          validationCredentialInvalid={validationCredentialInvalid}
          serverError={serverError}
          onEnterEmailBox={() => dispatch(resetFormEmailValidation())}
          onLeaveEmailBox={(email) => dispatch(validateFormSignInEmail(email))}
          onEditEmail={(email) => {
            dispatch(resetFormEmailValidation());
            dispatch(editFormEmail(email));
          }}
          onEnterPasswordBox={() => dispatch(resetFormPasswordValidation())}
          onLeavePasswordBox={(password) => dispatch(validateFormSignInPassword(password))}
          onEditPassword={(password) => {
            dispatch(resetFormPasswordValidation());
            dispatch(editFormPassword(password));
          }}
          onSubmit={(email, password) => {
            dispatch(validateFormSignInEmail(email));
            dispatch(validateFormSignInPassword(password));
            dispatch(submitSignInForm(email, password));
          }}
        />
        <div className="form-footer">
          <Link to="/forgot">Forgot Password?</Link>
          <Link to="/signup">Create an Account</Link>
        </div>
      </div>
    );
  }
}

SignIn.propTypes = {
  formSubmitting: React.PropTypes.bool,
  email: React.PropTypes.string,
  password: React.PropTypes.string,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationCredentialInvalid: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func
};

const mapStateToProps = state => ({
  formSubmitting: state.home.formSubmitting,
  email: state.home.formEmail,
  password: state.home.formPassword,
  validationEmailEmpty: state.home.formValidationEmailEmpty,
  validationEmailInvalid: state.home.formValidationEmailInvalid,
  validationPasswordEmpty: state.home.formValidationPasswordEmpty,
  validationCredentialInvalid: state.home.formValidationCredentialInvalid,
  serverError: state.home.serverError
});

export default connect(mapStateToProps)(SignIn);
