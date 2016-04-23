import React from 'react';
import classNames from 'classnames';
import { focusDOMElement } from '../utils/form';

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { email } = this.props;
    if (email.trim().length === 0) {
      focusDOMElement(this.refs.email, email.length);
    } else {
      focusDOMElement(this.refs.password);
    }
  }

  handleSubmit(e) {
    const { email, password, onSubmit } = this.props;
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password);
    }
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
      onEnterEmailBox,
      onLeaveEmailBox,
      onEditEmail,
      onEnterPasswordBox,
      onLeavePasswordBox,
      onEditPassword
    } = this.props;
    const emailClasses = classNames({ 'form-element': true, error: validationEmailEmpty || validationEmailInvalid });
    const passwordClasses = classNames({ 'form-element': true, error: validationPasswordEmpty });
    return (
      <form method="post" onSubmit={this.handleSubmit}>
        <div className={emailClasses}>
          <label htmlFor="signin-email">Email</label>
          <input
            type="email"
            id="signin-email"
            ref="email"
            value={email}
            onFocus={(e) => onEnterEmailBox ? onEnterEmailBox(e.target.value) : null}
            onBlur={(e) => onLeaveEmailBox ? onLeaveEmailBox(e.target.value) : null}
            onChange={(e) => onEditEmail(e.target.value)}
            disabled={formSubmitting}
          />
          <div className="validation">
            {validationEmailEmpty && <div className="error">Please type your email address to sign in.</div>}
            {validationEmailInvalid && <div className="error">Please type a valid email address to sign in.</div>}
          </div>
        </div>
        <div className={passwordClasses}>
          <label htmlFor="signin-password">Password</label>
          <input
            type="password"
            id="signin-password"
            ref="password"
            value={password}
            onFocus={(e) => onEnterPasswordBox ? onEnterPasswordBox(e.target.value) : null}
            onBlur={(e) => onLeavePasswordBox ? onLeavePasswordBox(e.target.value) : null}
            onChange={(e) => onEditPassword(e.target.value)}
            disabled={formSubmitting}
          />
          <div className="validation">
            {validationPasswordEmpty && <div className="error">Please type your password to sign in.</div>}
          </div>
        </div>
        {validationCredentialInvalid && <div className="error">The email and password you entered don't match.</div>}
        {serverError && <div className="error">
          Unable to sign in due to an internal server error. Please try again in several minutes.
        </div>}
        <div className="form-submit">
          <button type="submit" disabled={formSubmitting}>Sign in</button>
        </div>
      </form>
    );
  }
}

SignInForm.propTypes = {
  formSubmitting: React.PropTypes.bool,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationCredentialInvalid: React.PropTypes.bool.isRequired,
  serverError: React.PropTypes.bool,
  onEnterEmailBox: React.PropTypes.func,
  onLeaveEmailBox: React.PropTypes.func,
  onEditEmail: React.PropTypes.func.isRequired,
  onEnterPasswordBox: React.PropTypes.func,
  OnLeavePasswordBox: React.PropTypes.func,
  onEditPassword: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired
};

export default SignInForm;
