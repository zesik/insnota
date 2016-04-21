import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classname from 'classnames';
import { editEmail, editPassword, cleanupForm, signIn } from '../actions/home';

class SignIn extends React.Component {
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
    dispatch(signIn(this.props.email, this.props.password));
  }

  render() {
    const { dispatch } = this.props;
    const emailClasses = classname({ 'form-element': true, error: this.props.emailEmpty || this.props.emailInvalid });
    const passwordClasses = classname({ 'form-element': true, error: this.props.passwordEmpty });
    return (
      <div className="signin-form">
        <h1>Sign up</h1>
        <form method="post" onSubmit={this.handleSubmit}>
          <div className={emailClasses}>
            <label htmlFor="signin-email">Email</label>
            <input type="text" id="signin-email"
                   value={this.props.email} onChange={(e) => dispatch(editEmail(e.target.value))}
            />
            {this.props.emailEmpty && <div className="error">Email is empty.</div>}
            {this.props.emailInvalid && <div className="error">Email is not valid.</div>}
          </div>
          <div className={passwordClasses}>
            <label htmlFor="signin-password">Password</label>
            <input type="password" id="signin-password"
                   value={this.props.password} onChange={(e) => dispatch(editPassword(e.target.value))}
            />
            {this.props.passwordEmpty && <div className="error">Password is empty.</div>}
          </div>
          {this.props.credentialInvalid && <div className="error">The email and password you entered don't match.</div>}
          {this.props.serverError && <div className="error">Internal server error.</div>}
          <div className="form-submit">
            <button type="submit">Sign in</button>
          </div>
        </form>
        <div className="form-footer">
          <Link to="/forgot">Forgot Password?</Link>
          <Link to="/signup">Create an Account</Link>
        </div>
      </div>
    );
  }
}

SignIn.propTypes = {
  email: React.PropTypes.string,
  password: React.PropTypes.string,
  loading: React.PropTypes.bool,
  emailEmpty: React.PropTypes.bool,
  emailInvalid: React.PropTypes.bool,
  passwordEmpty: React.PropTypes.bool,
  credentialInvalid: React.PropTypes.bool,
  serverError: React.PropTypes.bool,
  dispatch: React.PropTypes.func
};

export default connect(state => state.home)(SignIn);
