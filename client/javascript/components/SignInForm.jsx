import React from 'react';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';
import Recaptcha from './Recaptcha';

export const FORM_STAGE_SIGN_IN_EMAIL = 'SIGN_IN_EMAIL';
export const FORM_STAGE_SIGN_IN_PASSWORD = 'SIGN_IN_PASSWORD';

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleEditEmail = this.handleEditEmail.bind(this);
    this.handleEditPassword = this.handleEditPassword.bind(this);
    this.handleEditRememberMe = this.handleEditRememberMe.bind(this);
    this.handleSubmitEmail = this.handleSubmitEmail.bind(this);
    this.handleSubmitPassword = this.handleSubmitPassword.bind(this);
  }

  handleEditEmail(e) {
    this.props.onEditEmail(e.target.value);
  }

  handleEditPassword(e) {
    this.props.onEditPassword(e.target.value);
  }

  handleEditRememberMe(e) {
    this.props.onEditRememberMe(e.target.checked);
  }

  handleSubmitEmail(e) {
    e.preventDefault();
    this.props.onSubmitEmail(this.props.email);
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
      <div className="form-group">
        <div className="form-control">
          <div className="form-control-supplement error">
            Unable to sign in due to an internal server error. Please try again in a few minutes.
          </div>
        </div>
      </div>
    );
    let form;
    if (this.props.stage === FORM_STAGE_SIGN_IN_EMAIL) {
      const emailClasses = classNames({
        'form-control': true,
        error: this.props.errorEmailEmpty || this.props.errorEmailInvalid || this.props.errorEmailNotExist
      });
      form = (
        <form method="post" onSubmit={this.handleSubmitEmail}>
          <div className="form-group">
            <label htmlFor="signin-email" className="control-label">Email</label>
            <div className={emailClasses}>
              <input
                type="text"
                className="textbox"
                id="signin-email"
                value={this.props.email}
                onChange={this.handleEditEmail}
                autoFocus
              />
              {this.props.errorEmailEmpty &&
                <div className="form-control-supplement error">
                  Please type your email address to sign in.
                </div>
              }
              {this.props.errorEmailInvalid &&
                <div className="form-control-supplement error">
                  Please type a valid email address to sign in.
                </div>
              }
              {this.props.errorEmailNotExist &&
                <div className="form-control-supplement error">
                  This email address is not registered.
                </div>
              }
            </div>
          </div>
          {this.props.errorServer && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={this.props.loading}>Next</button>
          </div>
        </form>
      );
    } else {
      const passwordClasses = classNames({
        'form-control': true,
        error: this.props.errorPasswordEmpty || this.props.errorCredentialInvalid
      });
      const recaptchaClasses = classNames({
        'form-control': true,
        error: this.props.errorRecaptchaInvalid
      });
      form = (
        <form method="post" onSubmit={this.handleSubmitPassword}>
          <a className="btn btn-link" onClick={this.props.onGoToEmailForm}>
            <i className="fa fa-arrow-left fa-2x" />
          </a>
          <div className="user-info">
            <UserAvatar email={this.props.email} size={96} cornerRadius={96} />
            <div className="user-name">{this.props.name}</div>
            <div className="user-email">{this.props.email}</div>
          </div>
          <div className="form-group">
            <label htmlFor="signin-password" className="control-label">Password</label>
            <div className={passwordClasses}>
              <input
                type="password"
                className="textbox"
                id="signin-password"
                value={this.props.password}
                onChange={this.handleEditPassword}
                autoFocus
              />
              {this.props.errorPasswordEmpty &&
                <div className="form-control-supplement error">
                  Please type your password to sign in.
                </div>
              }
              {this.props.errorCredentialInvalid &&
                <div className="form-control-supplement error">
                  The email and password you entered don't match.
                </div>
              }
            </div>
          </div>
          {this.props.recaptchaSiteKey &&
            <div className="form-group">
              <div className={recaptchaClasses}>
                <Recaptcha siteKey={this.props.recaptchaSiteKey} />
                {this.props.errorRecaptchaInvalid &&
                  <div className="form-control-supplement error">
                    Please verify that you are not a robot.
                  </div>
                }
              </div>
            </div>
          }
          {this.props.errorServer && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={this.props.loading}>Sign in</button>
          </div>
          <div className="form-group">
            <div className="form-checkbox">
              <label>
                <input type="checkbox" checked={this.props.rememberMe} onChange={this.handleEditRememberMe} />
                Stay signed in
              </label>
            </div>
          </div>
        </form>
      );
    }
    return form;
  }
}

SignInForm.propTypes = {
  loading: React.PropTypes.bool,
  stage: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  rememberMe: React.PropTypes.bool.isRequired,
  recaptchaSiteKey: React.PropTypes.string,
  errorServer: React.PropTypes.bool,
  errorEmailEmpty: React.PropTypes.bool,
  errorEmailInvalid: React.PropTypes.bool,
  errorEmailNotExist: React.PropTypes.bool,
  errorPasswordEmpty: React.PropTypes.bool,
  errorCredentialInvalid: React.PropTypes.bool,
  errorRecaptchaInvalid: React.PropTypes.bool,
  onEditEmail: React.PropTypes.func.isRequired,
  onEditPassword: React.PropTypes.func.isRequired,
  onEditRememberMe: React.PropTypes.func.isRequired,
  onSubmitEmail: React.PropTypes.func.isRequired,
  onSubmitPassword: React.PropTypes.func.isRequired,
  onGoToEmailForm: React.PropTypes.func.isRequired
};

export default SignInForm;
