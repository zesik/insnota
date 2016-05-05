import React from 'react';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';

class SignInForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleGoBack() {
    this.props.onGoBackToEmail();
  }

  handleSubmit(e) {
    const { formStep, email, password, onSubmitEmail, onSubmit } = this.props;
    e.preventDefault();
    if (formStep === 0) {
      onSubmitEmail(email);
    } else {
      onSubmit(email, password);
    }
  }

  render() {
    const {
      formSubmitting,
      formStep,
      name,
      email,
      password,
      validationEmailEmpty,
      validationEmailInvalid,
      validationEmailNotExist,
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
    const serverErrorElement = (
      <div className="form-element error">
        <div className="validation-error">
          Unable to sign in due to an internal server error. Please try again in several minutes.
        </div>
      </div>
    );
    let form;
    if (formStep === 0) {
      const emailClasses = classNames({
        'form-group': true,
        error: validationEmailEmpty || validationEmailInvalid || validationEmailNotExist
      });
      form = (
        <form method="post" onSubmit={this.handleSubmit}>
          <div className={emailClasses}>
            <label class="title" htmlFor="signin-email">Email</label>
            <input
              type="text"
              className="textbox"
              ref="email"
              value={email}
              onFocus={(e) => (onEnterEmailBox ? onEnterEmailBox(e.target.value) : null)}
              onBlur={(e) => (onLeaveEmailBox ? onLeaveEmailBox(e.target.value) : null)}
              onChange={(e) => onEditEmail(e.target.value)}
              disabled={formSubmitting}
              autoFocus
            />
            {validationEmailEmpty &&
              <div className="validation-error">Please type your email address to sign in.</div>
            }
            {validationEmailInvalid &&
              <div className="validation-error">Please type a valid email address to sign in.</div>
            }
            {validationEmailNotExist && <div className="validation-error">This email address is not registered.</div>}
          </div>
          {serverError && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={formSubmitting}>Next</button>
          </div>
        </form>
      );
    } else {
      const passwordClasses = classNames({
        'form-group': true,
        error: validationPasswordEmpty || validationCredentialInvalid
      });
      form = (
        <form method="post" onSubmit={this.handleSubmit}>
          <a className="go-back" onClick={this.handleGoBack}><i className="fa fa-arrow-left fa-2x" /></a>
          <div className="user-info">
            <UserAvatar email={email} size={96} cornerRadius={96} />
            <div className="user-name">{name}</div>
            <div className="user-email">{email}</div>
          </div>
          <div className={passwordClasses}>
            <label htmlFor="signin-password">Password</label>
            <input
              type="password"
              className="textbox"
              ref="password"
              value={password}
              onFocus={(e) => (onEnterPasswordBox ? onEnterPasswordBox(e.target.value) : null)}
              onBlur={(e) => (onLeavePasswordBox ? onLeavePasswordBox(e.target.value) : null)}
              onChange={(e) => onEditPassword(e.target.value)}
              disabled={formSubmitting}
              autoFocus
            />
            {validationPasswordEmpty && <div className="validation-error">Please type your password to sign in.</div>}
            {validationCredentialInvalid &&
              <div className="validation-error">The email and password you entered don't match.</div>
            }
          </div>
          {serverError && serverErrorElement}
          <div className="form-submit">
            <button className="btn btn-default" type="submit" disabled={formSubmitting}>Sign in</button>
          </div>
          <div className="form-checkbox">
            <label>
              <input type="checkbox" />
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
  formSubmitting: React.PropTypes.bool,
  formStep: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  email: React.PropTypes.string.isRequired,
  password: React.PropTypes.string.isRequired,
  validationEmailEmpty: React.PropTypes.bool,
  validationEmailInvalid: React.PropTypes.bool,
  validationEmailNotExist: React.PropTypes.bool,
  validationPasswordEmpty: React.PropTypes.bool,
  validationCredentialInvalid: React.PropTypes.bool.isRequired,
  serverError: React.PropTypes.bool,
  onEnterEmailBox: React.PropTypes.func,
  onLeaveEmailBox: React.PropTypes.func,
  onEditEmail: React.PropTypes.func.isRequired,
  onEnterPasswordBox: React.PropTypes.func,
  onLeavePasswordBox: React.PropTypes.func,
  onEditPassword: React.PropTypes.func.isRequired,
  onSubmitEmail: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  onGoBackToEmail: React.PropTypes.func.isRequired
};

export default SignInForm;
