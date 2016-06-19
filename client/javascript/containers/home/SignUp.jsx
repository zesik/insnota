import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SignUpForm from '../../components/SignUpForm';
import {
  resetForm,
  initializeSignUpForm,
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
} from '../../actions/home';

class SignUp extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(resetForm());
    dispatch(initializeSignUpForm());
  }

  render() {
    const { dispatch } = this.props;
    return (
      <div id="signup-form">
        <h1>Sign up</h1>
        <SignUpForm
          submitting={this.props.submitting}
          stage={this.props.stage}
          name={this.props.name}
          email={this.props.email}
          password={this.props.password}
          passwordConfirm={this.props.passwordConfirm}
          recaptchaSiteKey={this.props.recaptchaSiteKey}
          validationNameEmpty={this.props.validationNameEmpty}
          validatingEmail={this.props.validatingEmail}
          validationEmailEmpty={this.props.validationEmailEmpty}
          validationEmailInvalid={this.props.validationEmailInvalid}
          validationEmailOccupied={this.props.validationEmailOccupied}
          validationPasswordEmpty={this.props.validationPasswordEmpty}
          validationPasswordShort={this.props.validationPasswordShort}
          validationPasswordConfirmMismatch={this.props.validationPasswordConfirmMismatch}
          validationRecaptchaInvalid={this.props.validationRecaptchaInvalid}
          validationNotAllowed={this.props.validationNotAllowed}
          serverError={this.props.serverError}
          onEnterNameBox={() => dispatch(resetFormNameValidation())}
          onLeaveNameBox={name => dispatch(validateFormName(name))}
          onEditName={name => {
            dispatch(resetFormNameValidation());
            dispatch(editFormName(name));
          }}
          onEnterEmailBox={() => dispatch(resetFormEmailValidation())}
          onLeaveEmailBox={email => dispatch(validateFormSignUpEmail(email))}
          onEditEmail={email => {
            dispatch(resetFormEmailValidation());
            dispatch(editFormEmail(email));
          }}
          onEnterPasswordBox={() => dispatch(resetFormPasswordValidation())}
          onLeavePasswordBox={password => dispatch(validateFormSignUpPassword(password))}
          onEditPassword={password => {
            dispatch(resetFormPasswordValidation());
            dispatch(resetFormPasswordConfirmValidation());
            dispatch(editFormPassword(password));
          }}
          onEnterPasswordConfirmBox={() => dispatch(resetFormPasswordConfirmValidation())}
          onLeavePasswordConfirmBox={passwordConfirm => {
            dispatch(validateFormPasswordConfirm(this.props.password, passwordConfirm));
          }}
          onEditPasswordConfirm={passwordConfirm => {
            dispatch(resetFormPasswordConfirmValidation());
            dispatch(editFormPasswordConfirm(passwordConfirm));
          }}
          onSubmit={(name, email, password, passwordConfirm, recaptcha) => {
            dispatch(validateFormName(name));
            dispatch(validateFormSignUpEmail(email));
            dispatch(validateFormSignUpPassword(password));
            dispatch(validateFormPasswordConfirm(password, passwordConfirm));
            dispatch(submitSignUpForm(name, email, password, recaptcha));
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
  submitting: React.PropTypes.bool,
  stage: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  passwordConfirm: React.PropTypes.string.isRequired,
  recaptchaSiteKey: React.PropTypes.string,
  validationNameEmpty: React.PropTypes.bool,
  validatingEmail: React.PropTypes.bool,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationEmailOccupied: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationPasswordShort: React.PropTypes.bool,
  validationPasswordConfirmMismatch: React.PropTypes.bool,
  validationRecaptchaInvalid: React.PropTypes.bool,
  validationNotAllowed: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  submitting: state.home.submitting,
  stage: state.home.stage,
  name: state.home.name,
  email: state.home.email,
  password: state.home.password,
  passwordConfirm: state.home.passwordConfirm,
  recaptchaSiteKey: state.home.recaptchaSiteKey,
  validationNameEmpty: state.home.validationNameEmpty,
  validatingEmail: state.home.validatingEmail,
  validationEmailEmpty: state.home.validationEmailEmpty,
  validationEmailInvalid: state.home.validationEmailInvalid,
  validationEmailOccupied: state.home.validationEmailOccupied,
  validationPasswordEmpty: state.home.validationPasswordEmpty,
  validationPasswordShort: state.home.validationPasswordShort,
  validationPasswordConfirmMismatch: state.home.validationPasswordConfirmMismatch,
  validationRecaptchaInvalid: state.home.validationRecaptchaInvalid,
  validationNotAllowed: state.home.validationNotAllowed,
  serverError: state.home.serverError
});

export default connect(mapStateToProps)(SignUp);
