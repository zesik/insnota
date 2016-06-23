import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { setOldPassword, setNewPassword, setPasswordConfirmation, updatePassword } from '../../actions/settings';

class Security extends React.Component {
  constructor(props) {
    super(props);
    this.handleSetOldPassword = this.handleSetOldPassword.bind(this);
    this.handleSetNewPassword = this.handleSetNewPassword.bind(this);
    this.handleSetPasswordConfirmation = this.handleSetPasswordConfirmation.bind(this);
    this.handleUpdatePassword = this.handleUpdatePassword.bind(this);
  }

  handleSetOldPassword(e) {
    this.props.setOldPassword(e.target.value);
  }

  handleSetNewPassword(e) {
    this.props.setNewPassword(e.target.value);
  }

  handleSetPasswordConfirmation(e) {
    this.props.setPasswordConfirmation(e.target.value);
  }

  handleUpdatePassword(e) {
    const { updatePassword, oldPassword, newPassword, passwordConfirmation } = this.props;
    e.preventDefault();
    updatePassword(oldPassword, newPassword, passwordConfirmation);
  }

  render() {
    const oldPasswordClasses = classNames({
      'form-control': true,
      'error': this.props.errorOldPasswordIncorrect
    });
    const newPasswordClasses = classNames({
      'form-control': true,
      'error': this.props.errorNewPasswordEmpty || this.props.errorNewPasswordShort
    });
    const passwordConfirmationClasses = classNames({
      'form-control': true,
      'error': this.props.errorPasswordConfirmationMismatch
    });
    return (
      <div>
        <section>
          <form className="form-horizontal" onSubmit={this.handleUpdatePassword}>
            <h3 className="form-title">Password</h3>
            <div className="form-group">
              <label htmlFor="old-password" className="control-label">Old password</label>
              <div className={oldPasswordClasses}>
                <input
                  type="password"
                  className="textbox"
                  id="old-password"
                  value={this.props.oldPassword}
                  onChange={this.handleSetOldPassword}
                />
                {this.props.errorOldPasswordIncorrect &&
                  <div className="form-control-supplement error">
                    The password is incorrect.
                  </div>
                }
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="new-password" className="control-label">New password</label>
              <div className={newPasswordClasses}>
                <input
                  type="password"
                  className="textbox"
                  id="new-password"
                  value={this.props.newPassword}
                  onChange={this.handleSetNewPassword}
                />
                {this.props.errorNewPasswordShort &&
                  <div className="form-control-supplement error">
                    This password is too short.
                  </div>
                }
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-new-password" className="control-label">Confirm new password</label>
              <div className={passwordConfirmationClasses}>
                <input
                  type="password"
                  className="textbox"
                  id="confirm-new-password"
                  value={this.props.passwordConfirmation}
                  onChange={this.handleSetPasswordConfirmation}
                />
                {this.props.errorPasswordConfirmationMismatch &&
                  <div className="form-control-supplement error">
                    Password confirmation is different from the password.
                  </div>
                }
              </div>
            </div>
            {this.props.serverErrorPassword &&
              <div className="form-group">
                <label className="control-label" />
                <div className="form-control error">
                  <div className="error">
                    Unable to change your password due to internal server error. Please try again in a few minutes.
                  </div>
                </div>
              </div>
            }
            {this.props.successPassword &&
              <div className="form-group">
                <label className="control-label" />
                <div className="form-control success">
                  <div className="success">
                    Your password is changed.
                  </div>
                </div>
              </div>
            }
            <div className="form-submit">
              <input type="submit" className="btn btn-default" value="Change Password" disabled={this.props.loading} />
            </div>
          </form>
        </section>
      </div>
    );
  }
}

Security.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  oldPassword: React.PropTypes.string,
  newPassword: React.PropTypes.string,
  passwordConfirmation: React.PropTypes.string,
  errorOldPasswordIncorrect: React.PropTypes.bool,
  errorNewPasswordEmpty: React.PropTypes.bool,
  errorNewPasswordShort: React.PropTypes.bool,
  errorPasswordConfirmationMismatch: React.PropTypes.bool,
  successPassword: React.PropTypes.bool,
  serverErrorPassword: React.PropTypes.bool,
  setOldPassword: React.PropTypes.func.isRequired,
  setNewPassword: React.PropTypes.func.isRequired,
  setPasswordConfirmation: React.PropTypes.func.isRequired,
  updatePassword: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.settings;
}

function mapDispatchToProps(dispatch) {
  return {
    setOldPassword: oldPassword => {
      dispatch(setOldPassword(oldPassword));
    },
    setNewPassword: newPassword => {
      dispatch(setNewPassword(newPassword));
    },
    setPasswordConfirmation: passwordConfirmation => {
      dispatch(setPasswordConfirmation(passwordConfirmation));
    },
    updatePassword: (oldPassword, newPassword, passwordConfirmation) => {
      dispatch(updatePassword(oldPassword, newPassword, passwordConfirmation));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Security);
