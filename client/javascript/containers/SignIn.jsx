import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SignInForm, { FORM_STAGE_SIGN_IN_EMAIL, FORM_STAGE_SIGN_IN_PASSWORD } from '../components/SignInForm';
import {
  resetForm,
  editFormEmail,
  editFormPassword,
  editFormRememberMe,
  validateFormSignInEmail,
  validateFormSignInPassword,
  resetFormEmailValidation,
  resetFormPasswordValidation,
  updateFormStage,
  submitSignInEmail,
  submitSignInForm
} from '../actions/home';

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.handleSwitchAccountClicked = this.handleSwitchAccountClicked.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(resetForm());
    dispatch(updateFormStage(FORM_STAGE_SIGN_IN_EMAIL));
  }

  handleSwitchAccountClicked(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    dispatch(resetForm());
    dispatch(updateFormStage(FORM_STAGE_SIGN_IN_EMAIL));
  }

  render() {
    const { dispatch } = this.props;
    return (
      <div className="signin-form">
        <h1>Sign in</h1>
        <SignInForm
          submitting={this.props.submitting}
          stage={this.props.stage}
          name={this.props.name}
          email={this.props.email}
          password={this.props.password}
          rememberMe={this.props.rememberMe}
          recaptchaSiteKey={this.props.recaptchaSiteKey}
          validationEmailEmpty={this.props.validationEmailEmpty}
          validationEmailInvalid={this.props.validationEmailInvalid}
          validationEmailNotExist={this.props.validationEmailNotExist}
          validationPasswordEmpty={this.props.validationPasswordEmpty}
          validationCredentialInvalid={this.props.validationCredentialInvalid}
          validationRecaptchaInvalid={this.props.validationRecaptchaInvalid}
          serverError={this.props.serverError}
          onEnterEmailBox={() => dispatch(resetFormEmailValidation())}
          onEditEmail={email => {
            dispatch(resetFormEmailValidation());
            dispatch(editFormEmail(email));
          }}
          onEnterPasswordBox={() => dispatch(resetFormPasswordValidation())}
          onEditPassword={password => {
            dispatch(resetFormPasswordValidation());
            dispatch(editFormPassword(password));
          }}
          onEditRememberMe={(rememberMe) => dispatch(editFormRememberMe(rememberMe))}
          onSubmitEmail={email => {
            dispatch(validateFormSignInEmail(email));
            dispatch(submitSignInEmail(email));
          }}
          onSubmitPassword={(email, password, recaptcha) => {
            dispatch(validateFormSignInPassword(password));
            dispatch(submitSignInForm(email, password, recaptcha));
          }}
          onGoToEmailForm={() => dispatch(updateFormStage(FORM_STAGE_SIGN_IN_EMAIL))}
        />
        <div className="form-footer">
          {this.props.stage === FORM_STAGE_SIGN_IN_EMAIL && <Link to="/signup">Create an account</Link>}
          {this.props.stage === FORM_STAGE_SIGN_IN_PASSWORD &&
            <a href="" onClick={this.handleSwitchAccountClicked}>Sign in with a different account</a>
          }
        </div>
      </div>
    );
  }
}

SignIn.propTypes = {
  submitting: React.PropTypes.bool,
  stage: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  rememberMe: React.PropTypes.bool.isRequired,
  recaptchaSiteKey: React.PropTypes.string,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationEmailNotExist: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationCredentialInvalid: React.PropTypes.bool,
  validationRecaptchaInvalid: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  submitting: state.home.submitting,
  stage: state.home.stage,
  name: state.home.name,
  email: state.home.email,
  password: state.home.password,
  rememberMe: state.home.rememberMe,
  recaptchaSiteKey: state.home.recaptchaSiteKey,
  validationEmailEmpty: state.home.validationEmailEmpty,
  validationEmailInvalid: state.home.validationEmailInvalid,
  validationEmailNotExist: state.home.validationEmailNotExist,
  validationPasswordEmpty: state.home.validationPasswordEmpty,
  validationCredentialInvalid: state.home.validationCredentialInvalid,
  validationRecaptchaInvalid: state.home.validationRecaptchaInvalid,
  serverError: state.home.serverError
});

export default connect(mapStateToProps)(SignIn);
