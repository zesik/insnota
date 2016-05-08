import React from 'react';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';
import Recaptcha from './Recaptcha';

export const FORM_STAGE_SIGN_IN_EMAIL = 'SIGN_IN_EMAIL';
export const FORM_STAGE_SIGN_IN_PASSWORD = 'SIGN_IN_PASSWORD';

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
    this.handleSubmitPassword = this.handleSubmitPassword.bind(this);
  }

  handleSubmitEmail(e) {
    const { email, onSubmitEmail } = this.props;
    e.preventDefault();
    onSubmitEmail(email);
  }

  handleSubmitPassword(e) {
    const { email, password, rememberMe, onSubmitPassword } = this.props;
    e.preventDefault();
    let recaptcha = null;
    const elements = document.getElementsByName('g-recaptcha-response');
    if (elements.length) {
      recaptcha = elements[0].value;
    }
    onSubmitPassword(email, password, rememberMe, recaptcha);
  }

  render() {
    const serverErrorElement = (
      <div className="form-element error">
        <div className="validation-error">
          Unable to sign in due to an internal server error. Please try again in a few minutes.
        </div>
      </div>
    );
    let form;
    if (this.props.stage === FORM_STAGE_SIGN_IN_EMAIL) {
      const emailClasses = classNames({
        'form-group': true,
        error: this.props.validationEmailEmpty || this.props.validationEmailInvalid ||
          this.props.validationEmailNotExist
      });
      form = (
        <form method="post" onSubmit={this.handleSubmitEmail}>
          <div className={emailClasses}>
            <label className="title" htmlFor="signin-email">Email</label>
            <input
              type="text"
              className="textbox"
              value={this.props.email}
              onFocus={(e) => (this.props.onEnterEmailBox ? this.props.onEnterEmailBox(e.target.value) : null)}
              onBlur={(e) => (this.props.onLeaveEmailBox ? this.props.onLeaveEmailBox(e.target.value) : null)}
              onChange={(e) => this.props.onEditEmail(e.target.value)}
              autoFocus
            />
            {this.props.validationEmailEmpty &&
              <div className="validation-error">Please type your email address to sign in.</div>
            }
            {this.props.validationEmailInvalid &&
              <div className="validation-error">Please type a valid email address to sign in.</div>
            }
            {this.props.validationEmailNotExist &&
              <div className="validation-error">This email address is not registered.</div>
            }
          </div>
          {this.props.serverError && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={this.props.submitting}>Next</button>
          </div>
        </form>
      );
    } else {
      const passwordClasses = classNames({
        'form-group': true,
        error: this.props.validationPasswordEmpty || this.props.validationCredentialInvalid
      });
      const recaptchaClasses = classNames({
        'form-group': true,
        error: this.props.validationRecaptchaInvalid
      });
      form = (
        <form method="post" onSubmit={this.handleSubmitPassword}>
          <a className="go-back" onClick={this.props.onGoToEmailForm}><i className="fa fa-arrow-left fa-2x" /></a>
          <div className="user-info">
            <UserAvatar email={this.props.email} size={96} cornerRadius={96} />
            <div className="user-name">{this.props.name}</div>
            <div className="user-email">{this.props.email}</div>
          </div>
          <div className={passwordClasses}>
            <label htmlFor="signin-password">Password</label>
            <input
              type="password"
              className="textbox"
              value={this.props.password}
              onFocus={(e) => (this.props.onEnterPasswordBox ? this.props.onEnterPasswordBox(e.target.value) : null)}
              onBlur={(e) => (this.props.onLeavePasswordBox ? this.props.onLeavePasswordBox(e.target.value) : null)}
              onChange={(e) => this.props.onEditPassword(e.target.value)}
              autoFocus
            />
            {this.props.validationPasswordEmpty &&
              <div className="validation-error">Please type your password to sign in.</div>
            }
            {this.props.validationCredentialInvalid &&
              <div className="validation-error">The email and password you entered don't match.</div>
            }
          </div>
          {this.props.recaptchaSiteKey &&
            <div className={recaptchaClasses}>
              <Recaptcha siteKey={this.props.recaptchaSiteKey} />
              {this.props.validationRecaptchaInvalid &&
                <div className="validation-error">Please verify that you are not a robot.</div>
              }
            </div>
          }
          {this.props.serverError && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={this.props.submitting}>Sign in</button>
          </div>
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={this.props.rememberMe}
                onChange={(e) => this.props.onEditRememberMe(e.target.checked)}
              />
              Stay signed in
            </label>
          </div>
        </form>
      );
    }
    return form;
  }
}

SignInForm.propTypes = {
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
  onEnterEmailBox: React.PropTypes.func,
  onLeaveEmailBox: React.PropTypes.func,
  onEditEmail: React.PropTypes.func.isRequired,
  onEnterPasswordBox: React.PropTypes.func,
  onLeavePasswordBox: React.PropTypes.func,
  onEditPassword: React.PropTypes.func.isRequired,
  onEditRememberMe: React.PropTypes.func.isRequired,
  onSubmitEmail: React.PropTypes.func.isRequired,
  onSubmitPassword: React.PropTypes.func.isRequired,
  onGoToEmailForm: React.PropTypes.func.isRequired
};

export default SignInForm;
