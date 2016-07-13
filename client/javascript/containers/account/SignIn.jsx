import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import SignInForm, { FORM_STAGE_SIGN_IN_EMAIL, FORM_STAGE_SIGN_IN_PASSWORD } from '../../components/SignInForm';
import {
  initializeSignInForm,
  setFormStage,
  editEmail,
  editPassword,
  editRememberMe,
  submitSignInEmail,
  submitSignInForm
} from '../../actions/account';

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.handleSwitchAccountClicked = this.handleSwitchAccountClicked.bind(this);
  }

  componentDidMount() {
    this.props.initializeForm();
    document.title = 'Sign In | Insnota';
  }

  handleSwitchAccountClicked(e) {
    e.preventDefault();
    this.props.initializeForm();
  }

  render() {
    return (
      <div id="signin-form">
        <h1>Sign in</h1>
        <SignInForm
          loading={this.props.loading}
          stage={this.props.stage}
          name={this.props.name}
          email={this.props.email}
          password={this.props.password}
          rememberMe={this.props.rememberMe}
          recaptchaSiteKey={this.props.recaptchaSiteKey}
          errorEmailEmpty={this.props.errorEmailEmpty}
          errorEmailInvalid={this.props.errorEmailInvalid}
          errorEmailNotExist={this.props.errorEmailNotExist}
          errorPasswordEmpty={this.props.errorPasswordEmpty}
          errorCredentialInvalid={this.props.errorCredentialInvalid}
          errorRecaptchaInvalid={this.props.errorRecaptchaInvalid}
          serverError={this.props.serverError}
          onEditEmail={this.props.onEditEmail}
          onEditPassword={this.props.onEditPassword}
          onEditRememberMe={this.props.onEditRememberMe}
          onSubmitEmail={this.props.onSubmitEmail}
          onSubmitPassword={this.props.onSubmitPassword}
          onGoToEmailForm={this.props.onGoBack}
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
  loading: React.PropTypes.bool.isRequired,
  stage: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  rememberMe: React.PropTypes.bool.isRequired,
  recaptchaSiteKey: React.PropTypes.string,
  errorEmailEmpty: React.PropTypes.bool,
  errorEmailInvalid: React.PropTypes.bool,
  errorEmailNotExist: React.PropTypes.bool,
  errorPasswordEmpty: React.PropTypes.bool,
  errorCredentialInvalid: React.PropTypes.bool,
  errorRecaptchaInvalid: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  initializeForm: React.PropTypes.func.isRequired,
  onEditEmail: React.PropTypes.func.isRequired,
  onEditPassword: React.PropTypes.func.isRequired,
  onEditRememberMe: React.PropTypes.func.isRequired,
  onGoBack: React.PropTypes.func.isRequired,
  onSubmitEmail: React.PropTypes.func.isRequired,
  onSubmitPassword: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.account;
}

function mapDispatchToProps(dispatch) {
  return {
    initializeForm: () => {
      dispatch(initializeSignInForm());
    },
    onEditEmail: email => {
      dispatch(editEmail(email));
    },
    onEditPassword: password => {
      dispatch(editPassword(password));
    },
    onEditRememberMe: rememberMe => {
      dispatch(editRememberMe(rememberMe));
    },
    onSubmitEmail: email => {
      dispatch(submitSignInEmail(email));
    },
    onSubmitPassword: (email, password, rememberMe, recaptcha) => {
      dispatch(submitSignInForm(email, password, rememberMe, recaptcha));
    },
    onGoBack: () => {
      dispatch(setFormStage(FORM_STAGE_SIGN_IN_EMAIL));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);
