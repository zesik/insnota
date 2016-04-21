import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classname from 'classnames';
import { editName, editEmail, editPassword, editPasswordConfirm, cleanupForm, signUp } from '../actions/home';

class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(cleanupForm());
  }

  handleSubmit(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    dispatch(signUp(this.props.name, this.props.email, this.props.password));
  }

  render() {
    const { dispatch } = this.props;
    const nameClasses = classname({ 'form-element': true, error: this.props.nameEmpty });
    const emailClasses = classname({
      'form-element': true,
      error: this.props.emailEmpty || this.props.emailInvalid || this.props.emailOccupied
    });
    const passwordClasses = classname({
      'form-element': true,
      error: this.props.passwordEmpty || this.props.passwordShort
    });
    const passwordConfirmClasses = classname({ 'form-element': true, error: this.props.passwordMismatch });
    return (
      <div className="signup-form">
        <h1>Sign up</h1>
        <form method="post" onSubmit={this.handleSubmit}>
          <div className={nameClasses}>
            <label htmlFor="signup-name">Name</label>
            <input type="text" id="signup-name"
              value={this.props.name} onChange={(e) => dispatch(editName(e.target.value))}
            />
            {this.props.nameEmpty && <div className="error">Name is empty.</div>}
          </div>
          <div className={emailClasses}>
            <label htmlFor="signup-email">Email</label>
            <input type="text" id="signup-email"
              value={this.props.email} onChange={(e) => dispatch(editEmail(e.target.value))}
            />
            {this.props.emailEmpty && <div className="error">Email is empty.</div>}
            {this.props.emailInvalid && <div className="error">Email is not valid.</div>}
            {this.props.emailOccupied && <div className="error">Email is occupied.</div>}
          </div>
          <div className={passwordClasses}>
            <label htmlFor="signup-password">Password</label>
            <input type="password" id="signup-password"
              value={this.props.password} onChange={(e) => dispatch(editPassword(e.target.value))}
            />
            {this.props.passwordEmpty && <div className="error">Password is empty.</div>}
            {this.props.passwordShort && <div className="error">Password is too short.</div>}
          </div>
          <div className={passwordConfirmClasses}>
            <label htmlFor="signup-password">Confirm Password</label>
            <input type="password" id="signup-password"
              value={this.props.passwordConfirm} onChange={(e) => dispatch(editPasswordConfirm(e.target.value))}
            />
            {this.props.passwordMismatch && <div className="error">Password confirmation does not match.</div>}
          </div>
          {this.props.serverError && <div className="error">Internal server error.</div>}
          <div className="form-submit">
            <button type="submit">Sign up</button>
          </div>
        </form>
        <div className="form-footer">
          <Link to="/signin">Sign in</Link>
        </div>
      </div>
    );
  }
}

SignUp.propTypes = {
  name: React.PropTypes.string,
  email: React.PropTypes.string,
  password: React.PropTypes.string,
  passwordConfirm: React.PropTypes.string,
  loading: React.PropTypes.bool,
  nameEmpty: React.PropTypes.bool,
  emailEmpty: React.PropTypes.bool,
  emailInvalid: React.PropTypes.bool,
  emailOccupied: React.PropTypes.bool,
  passwordEmpty: React.PropTypes.bool,
  passwordShort: React.PropTypes.bool,
  passwordMismatch: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func
};

export default connect(state => state.home)(SignUp);
