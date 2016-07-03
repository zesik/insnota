import React from 'react';
import classNames from 'classnames';
import Recaptcha from './Recaptcha';

export const FORM_STAGE_SIGN_UP_FORBIDDEN = 'FORM_STAGE_SIGN_UP_FORBIDDEN';
export const FORM_STAGE_SIGN_UP_READY = 'FORM_STAGE_SIGN_UP_READY';

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleEditName = this.handleEditName.bind(this);
    this.handleEditEmail = this.handleEditEmail.bind(this);
    this.handleEditPassword = this.handleEditPassword.bind(this);
    this.handleEditPasswordConfirmation = this.handleEditPasswordConfirmation.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEditName(e) {
    this.props.onEditName(e.target.value);
  }

  handleEditEmail(e) {
    this.props.onEditEmail(e.target.value);
  }

  handleEditPassword(e) {
    this.props.onEditPassword(e.target.value);
  }

  handleEditPasswordConfirmation(e) {
    this.props.onEditPasswordConfirmation(e.target.value);
  }

  handleSubmit(e) {
    const { name, email, password, passwordConfirmation, onSubmit } = this.props;
    e.preventDefault();
    let recaptcha = null;
    const elements = document.getElementsByName('g-recaptcha-response');
    if (elements.length) {
      recaptcha = elements[0].value;
    }
    onSubmit(name, email, password, passwordConfirmation, recaptcha);
  }

  render() {
    const serverErrorElement = (
      <div className="form-group">
        <div className="form-control error">
          <div className="form-control-supplement error">
            Unable to sign up due to an internal server error. Please try again in a few minutes.
          </div>
        </div>
      </div>
    );
    const notAllowedElement = (
      <div className="form-group">
        <div className="form-control error">
          <div className="form-control-supplement error">
            Signing up is currently not allowed. Please check back later.
          </div>
        </div>
      </div>
    );
    let form;
    if (this.props.stage === FORM_STAGE_SIGN_UP_FORBIDDEN) {
      form = (
        <div className="form-info-container">
          Signing up is currently not allowed. Please check back later.
        </div>
      );
    } else if (this.props.stage === FORM_STAGE_SIGN_UP_READY) {
      const nameClasses = classNames({
        'form-control': true,
        error: this.props.errorNameEmpty
      });
      const emailClasses = classNames({
        'form-control': true,
        error: this.props.errorEmailEmpty || this.props.errorEmailInvalid || this.props.errorEmailOccupied
      });
      const passwordClasses = classNames({
        'form-control': true,
        error: this.props.errorPasswordEmpty || this.props.errorPasswordShort
      });
      const passwordConfirmClasses = classNames({
        'form-control': true,
        error: this.props.errorPasswordConfirmationMismatch
      });
      const recaptchaClasses = classNames({
        'form-control': true,
        error: this.props.errorRecaptchaInvalid
      });
      form = (
        <form method="post" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-name" className="control-label">Name</label>
            <div className={nameClasses}>
              <input
                type="text"
                className="textbox"
                id="signup-name"
                value={this.props.name}
                onChange={this.handleEditName}
                autoFocus
              />
              {this.props.errorNameEmpty &&
                <div className="form-control-supplement error">Name cannot be blank.</div>
              }
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="signup-email" className="control-label">Email Address</label>
            <div className={emailClasses}>
              <input
                type="text"
                className="textbox"
                id="signup-email"
                value={this.props.email}
                onChange={this.handleEditEmail}
              />
              {this.props.errorEmailEmpty &&
                <div className="form-control-supplement error">Email address cannot be blank.</div>
              }
              {this.props.errorEmailInvalid &&
                <div className="form-control-supplement error">This is not a valid email address.</div>
              }
              {this.props.errorEmailOccupied &&
                <div className="form-control-supplement error">This email address is occupied.</div>
              }
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="signup-password" className="control-label">Choose a Password</label>
            <div className={passwordClasses}>
              <input
                type="password"
                className="textbox"
                id="signup-password"
                value={this.props.password}
                onChange={this.handleEditPassword}
              />
              {this.props.errorPasswordEmpty &&
                <div className="form-control-supplement error">Password cannot be blank.</div>
              }
              {this.props.errorPasswordShort &&
                <div className="form-control-supplement error">This password is too short.</div>
              }
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="signup-password-confirm" className="control-label">Confirm Your Password</label>
            <div className={passwordConfirmClasses}>
              <input
                type="password"
                className="textbox"
                id="signup-password-confirm"
                value={this.props.passwordConfirmation}
                onChange={(e) => this.props.onEditPasswordConfirmation(e.target.value)}
              />
              {this.props.errorPasswordConfirmationMismatch &&
                <div className="form-control-supplement error">Password confirmation is different from password.</div>
              }
            </div>
          </div>
          {this.props.recaptchaSiteKey &&
            <div className="form-group">
              <div className={recaptchaClasses}>
                <Recaptcha siteKey={this.props.recaptchaSiteKey} />
                {this.props.errorRecaptchaInvalid &&
                  <div className="form-control-supplement error">Please verify that you are not a robot.</div>
                }
              </div>
            </div>
          }
          {this.props.errorNotAllowed && notAllowedElement}
          {this.props.serverError && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={this.props.loading}>Sign up</button>
          </div>
        </form>
      );
    } else {
      form = (
        <div className="form-info-container">
          {this.props.loading && <div>Loading...</div>}
          {this.props.serverError && serverErrorElement}
        </div>
      );
    }
    return form;
  }
}

SignUpForm.propTypes = {
  loading: React.PropTypes.bool,
  stage: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  passwordConfirmation: React.PropTypes.string.isRequired,
  recaptchaSiteKey: React.PropTypes.string,
  errorNotAllowed: React.PropTypes.bool,
  errorNameEmpty: React.PropTypes.bool,
  errorEmailEmpty: React.PropTypes.bool,
  errorEmailInvalid: React.PropTypes.bool,
  errorEmailOccupied: React.PropTypes.bool,
  errorPasswordEmpty: React.PropTypes.bool,
  errorPasswordShort: React.PropTypes.bool,
  errorPasswordConfirmationMismatch: React.PropTypes.bool,
  errorRecaptchaInvalid: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  onEditName: React.PropTypes.func.isRequired,
  onEditEmail: React.PropTypes.func.isRequired,
  onEditPassword: React.PropTypes.func.isRequired,
  onEditPasswordConfirmation: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired
};

export default SignUpForm;
