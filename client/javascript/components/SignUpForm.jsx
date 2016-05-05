import React from 'react';
import classNames from 'classnames';

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    const { name, email, password, passwordConfirm, onSubmit } = this.props;
    e.preventDefault();
    onSubmit(name, email, password, passwordConfirm);
  }

  render() {
    const {
      formSubmitting,
      name,
      email,
      password,
      passwordConfirm,
      validationNameEmpty,
      validationEmailEmpty,
      validationEmailInvalid,
      validationEmailOccupied,
      validationPasswordEmpty,
      validationPasswordShort,
      validationPasswordConfirmMismatch,
      serverError,
      onEnterNameBox,
      onLeaveNameBox,
      onEditName,
      onEnterEmailBox,
      onLeaveEmailBox,
      onEditEmail,
      onEnterPasswordBox,
      onLeavePasswordBox,
      onEditPassword,
      onEnterPasswordConfirmBox,
      onLeavePasswordConfirmBox,
      onEditPasswordConfirm
    } = this.props;
    const nameClasses = classNames({
      'form-group': true,
      error: validationNameEmpty
    });
    const emailClasses = classNames({
      'form-group': true,
      error: validationEmailEmpty || validationEmailInvalid || validationEmailOccupied
    });
    const passwordClasses = classNames({
      'form-group': true,
      error: validationPasswordEmpty || validationPasswordShort
    });
    const passwordConfirmClasses = classNames({
      'form-group': true,
      error: validationPasswordConfirmMismatch
    });
    return (
      <form method="post" onSubmit={this.handleSubmit}>
        <div className={nameClasses}>
          <label htmlFor="signup-name">Name</label>
          <input
            type="text"
            className="textbox"
            ref="name"
            value={name}
            onFocus={(e) => (onEnterNameBox ? onEnterNameBox(e.target.value) : null)}
            onBlur={(e) => (onLeaveNameBox ? onLeaveNameBox(e.target.value) : null)}
            onChange={(e) => onEditName(e.target.value)}
            disabled={formSubmitting}
          />
          {validationNameEmpty && <div className="validation-error">Name cannot be blank.</div>}
        </div>
        <div className={emailClasses}>
          <label htmlFor="signup-email">Email Address</label>
          <input
            type="text"
            className="textbox"
            ref="email"
            value={email}
            onFocus={(e) => (onEnterEmailBox ? onEnterEmailBox(e.target.value) : null)}
            onBlur={(e) => (onLeaveEmailBox ? onLeaveEmailBox(e.target.value) : null)}
            onChange={(e) => onEditEmail(e.target.value)}
            disabled={formSubmitting}
          />
          {validationEmailEmpty && <div className="validation-error">Email address cannot be blank.</div>}
          {validationEmailInvalid && <div className="validation-error">This is not a valid email address.</div>}
          {validationEmailOccupied && <div className="validation-error">This email address is occupied.</div>}
        </div>
        <div className={passwordClasses}>
          <label htmlFor="signup-password">Choose a Password</label>
          <input
            type="password"
            className="textbox"
            ref="password"
            value={password}
            onFocus={(e) => (onEnterPasswordBox ? onEnterPasswordBox(e.target.value) : null)}
            onBlur={(e) => (onLeavePasswordBox ? onLeavePasswordBox(e.target.value) : null)}
            onChange={(e) => onEditPassword(e.target.value)}
            disabled={formSubmitting}
          />
          {validationPasswordEmpty && <div className="validation-error">Password cannot be blank.</div>}
          {validationPasswordShort && <div className="validation-error">This password is too short.</div>}
        </div>
        <div className={passwordConfirmClasses}>
          <label htmlFor="signup-password-confirm">Confirm Your Password</label>
          <input
            type="password"
            className="textbox"
            ref="passwordConfirm"
            value={passwordConfirm}
            onFocus={(e) => (onEnterPasswordConfirmBox ? onEnterPasswordConfirmBox(e.target.value) : null)}
            onBlur={(e) => (onLeavePasswordConfirmBox ? onLeavePasswordConfirmBox(e.target.value) : null)}
            onChange={(e) => onEditPasswordConfirm(e.target.value)}
            disabled={formSubmitting}
          />
          {validationPasswordConfirmMismatch &&
            <div className="validation-error">Password confirmation is different from password.</div>
          }
        </div>
        {serverError &&
          <div className="form-element error">
            <div className="validation-error">
              Unable to sign up due to an internal server error. Please try again in several minutes.
            </div>
          </div>
        }
        <div className="form-submit">
          <button className="btn btn-default" type="submit" disabled={formSubmitting}>Sign up</button>
        </div>
      </form>
    );
  }
}

SignUpForm.propTypes = {
  formSubmitting: React.PropTypes.bool,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  passwordConfirm: React.PropTypes.string.isRequired,
  validationNameEmpty: React.PropTypes.bool,
  validatingEmail: React.PropTypes.bool,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationEmailOccupied: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationPasswordShort: React.PropTypes.bool,
  validationPasswordConfirmMismatch: React.PropTypes.bool,
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
