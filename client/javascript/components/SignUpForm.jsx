import React from 'react';
import classNames from 'classnames';
import Recaptcha from './Recaptcha';

export const FORM_STAGE_SIGN_UP_INITIALIZING = 'FORM_STAGE_SIGN_UP_INITIALIZING';
export const FORM_STAGE_SIGN_UP_FORBIDDEN = 'FORM_STAGE_SIGN_UP_FORBIDDEN';
export const FORM_STAGE_SIGN_UP_READY = 'FORM_STAGE_SIGN_UP_READY';

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    const { name, email, password, passwordConfirm, onSubmit } = this.props;
    e.preventDefault();
    let recaptcha = null;
    const elements = document.getElementsByName('g-recaptcha-response');
    if (elements.length) {
      recaptcha = elements[0].value;
    }
    onSubmit(name, email, password, passwordConfirm, recaptcha);
  }

  render() {
    const serverErrorElement = (
      <div className="form-group error">
        <div className="validation-error">
          Unable to sign up due to an internal server error. Please try again in a few minutes.
        </div>
      </div>
    );
    const notAllowedElement = (
      <div className="form-group error">
        <form className="validation-error">
          Signing up is currently not allowed. Please check back later.
        </form>
      </div>
    );
    let form;
    if (this.props.stage === FORM_STAGE_SIGN_UP_INITIALIZING) {
      form = (
        <div className="form-info-container">
          {this.props.submitting && <div>Loading...</div>}
          {this.props.serverError && serverErrorElement}
        </div>
      );
    } else if (this.props.stage === FORM_STAGE_SIGN_UP_FORBIDDEN) {
      form = (
        <div className="form-info-container">
          {this.props.validationNotAllowed && notAllowedElement}
        </div>
      );
    } else {
      const nameClasses = classNames({
        'form-group': true,
        error: this.props.validationNameEmpty
      });
      const emailClasses = classNames({
        'form-group': true,
        error: this.props.validationEmailEmpty || this.props.validationEmailInvalid ||
          this.props.validationEmailOccupied
      });
      const passwordClasses = classNames({
        'form-group': true,
        error: this.props.validationPasswordEmpty || this.props.validationPasswordShort
      });
      const passwordConfirmClasses = classNames({
        'form-group': true,
        error: this.props.validationPasswordConfirmMismatch
      });
      const recaptchaClasses = classNames({
        'form-group': true,
        error: this.props.validationRecaptchaInvalid
      });
      form = (
        <form method="post" onSubmit={this.handleSubmit}>
          <div className={nameClasses}>
            <label htmlFor="signup-name">Name</label>
            <input
              type="text"
              className="textbox"
              value={this.props.name}
              onFocus={(e) => (this.props.onEnterNameBox ? this.props.onEnterNameBox(e.target.value) : null)}
              onBlur={(e) => (this.props.onLeaveNameBox ? this.props.onLeaveNameBox(e.target.value) : null)}
              onChange={(e) => this.props.onEditName(e.target.value)}
              autoFocus
            />
            {this.props.validationNameEmpty && <div className="validation-error">Name cannot be blank.</div>}
          </div>
          <div className={emailClasses}>
            <label htmlFor="signup-email">Email Address</label>
            <input
              type="text"
              className="textbox"
              value={this.props.email}
              onFocus={(e) => (this.props.onEnterEmailBox ? this.props.onEnterEmailBox(e.target.value) : null)}
              onBlur={(e) => (this.props.onLeaveEmailBox ? this.props.onLeaveEmailBox(e.target.value) : null)}
              onChange={(e) => this.props.onEditEmail(e.target.value)}
            />
            {this.props.validationEmailEmpty &&
              <div className="validation-error">Email address cannot be blank.</div>
            }
            {this.props.validationEmailInvalid &&
              <div className="validation-error">This is not a valid email address.</div>
            }
            {this.props.validationEmailOccupied &&
              <div className="validation-error">This email address is occupied.</div>
            }
          </div>
          <div className={passwordClasses}>
            <label htmlFor="signup-password">Choose a Password</label>
            <input
              type="password"
              className="textbox"
              value={this.props.password}
              onFocus={(e) => (this.props.onEnterPasswordBox ? this.props.onEnterPasswordBox(e.target.value) : null)}
              onBlur={(e) => (this.props.onLeavePasswordBox ? this.props.onLeavePasswordBox(e.target.value) : null)}
              onChange={(e) => this.props.onEditPassword(e.target.value)}
            />
            {this.props.validationPasswordEmpty && <div className="validation-error">Password cannot be blank.</div>}
            {this.props.validationPasswordShort && <div className="validation-error">This password is too short.</div>}
          </div>
          <div className={passwordConfirmClasses}>
            <label htmlFor="signup-password-confirm">Confirm Your Password</label>
            <input
              type="password"
              className="textbox"
              value={this.props.passwordConfirm}
              onFocus={(e) => {
                if (this.props.onEnterPasswordConfirmBox) {
                  this.props.onEnterPasswordConfirmBox(e.target.value);
                }
              }}
              onBlur={(e) => {
                if (this.props.onLeavePasswordConfirmBox) {
                  this.props.onLeavePasswordConfirmBox(e.target.value);
                }
              }}
              onChange={(e) => this.props.onEditPasswordConfirm(e.target.value)}
            />
            {this.props.validationPasswordConfirmMismatch &&
              <div className="validation-error">Password confirmation is different from password.</div>
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
          {this.props.validationNotAllowed && notAllowedElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={this.props.submitting}>Sign up</button>
          </div>
        </form>
      );
    }
    return form;
  }
}

SignUpForm.propTypes = {
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
  onEnterNameBox: React.PropTypes.func,
  onLeaveNameBox: React.PropTypes.func,
  onEditName: React.PropTypes.func.isRequired,
  onEnterEmailBox: React.PropTypes.func,
  onLeaveEmailBox: React.PropTypes.func,
  onEditEmail: React.PropTypes.func.isRequired,
  onEnterPasswordBox: React.PropTypes.func,
  onLeavePasswordBox: React.PropTypes.func,
  onEditPassword: React.PropTypes.func.isRequired,
  onEnterPasswordConfirmBox: React.PropTypes.func,
  onLeavePasswordConfirmBox: React.PropTypes.func,
  onEditPasswordConfirm: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired
};

export default SignUpForm;
