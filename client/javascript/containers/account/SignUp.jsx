import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SignUpForm from '../../components/SignUpForm';
import {
  initializeSignUpForm,
  editName,
  editEmail,
  editPassword,
  editPasswordConfirmation,
  submitSignUpForm
} from '../../actions/account';

class SignUp extends React.Component {
  componentDidMount() {
    this.props.initializeForm();
  }

  render() {
    return (
      <div id="signup-form">
        <h1>Sign up</h1>
        <SignUpForm
          loading={this.props.loading}
          stage={this.props.stage}
          name={this.props.name}
          email={this.props.email}
          password={this.props.password}
          passwordConfirmation={this.props.passwordConfirmation}
          recaptchaSiteKey={this.props.recaptchaSiteKey}
          errorNameEmpty={this.props.errorNameEmpty}
          errorEmailEmpty={this.props.errorEmailEmpty}
          errorEmailInvalid={this.props.errorEmailInvalid}
          errorEmailOccupied={this.props.errorEmailOccupied}
          errorPasswordEmpty={this.props.errorPasswordEmpty}
          errorPasswordShort={this.props.errorPasswordShort}
          errorPasswordConfirmationMismatch={this.props.errorPasswordConfirmationMismatch}
          errorRecaptchaInvalid={this.props.errorRecaptchaInvalid}
          errorNotAllowed={this.props.errorNotAllowed}
          serverError={this.props.serverError}
          onEditName={this.props.onEditName}
          onEditEmail={this.props.onEditEmail}
          onEditPassword={this.props.onEditPassword}
          onEditPasswordConfirmation={this.props.onEditPasswordConfirmation}
          onSubmit={this.props.onSubmit}
        />
        <div className="form-footer">
          Already have an account? <Link to="/signin">Sign in</Link>
        </div>
      </div>
    );
  }
}

SignUp.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  stage: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  passwordConfirmation: React.PropTypes.string.isRequired,
  recaptchaSiteKey: React.PropTypes.string,
  errorNameEmpty: React.PropTypes.bool,
  errorEmail: React.PropTypes.bool,
  errorEmailEmpty: React.PropTypes.bool,
  errorEmailInvalid: React.PropTypes.bool,
  errorEmailOccupied: React.PropTypes.bool,
  errorPasswordEmpty: React.PropTypes.bool,
  errorPasswordShort: React.PropTypes.bool,
  errorPasswordConfirmationMismatch: React.PropTypes.bool,
  errorRecaptchaInvalid: React.PropTypes.bool,
  errorNotAllowed: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  initializeForm: React.PropTypes.func.isRequired,
  onEditName: React.PropTypes.func.isRequired,
  onEditEmail: React.PropTypes.func.isRequired,
  onEditPassword: React.PropTypes.func.isRequired,
  onEditPasswordConfirmation: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.account;
}

function mapDispatchToProps(dispatch) {
  return {
    initializeForm: () => {
      dispatch(initializeSignUpForm());
    },
    onEditName: name => {
      dispatch(editName(name));
    },
    onEditEmail: email => {
      dispatch(editEmail(email));
    },
    onEditPassword: password => {
      dispatch(editPassword(password));
    },
    onEditPasswordConfirmation: passwordConfirmation => {
      dispatch(editPasswordConfirmation(passwordConfirmation));
    },
    onSubmit: (name, email, password, passwordConfirmation, recaptcha) => {
      dispatch(submitSignUpForm(name, email, password, passwordConfirmation, recaptcha));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
