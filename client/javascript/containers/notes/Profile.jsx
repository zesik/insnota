import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import UserAvatar from '../../components/UserAvatar';
import { setProfileName, updateProfile } from '../../actions/settings';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.handleNameChanged = this.handleNameChanged.bind(this);
    this.handleUpdateProfile = this.handleUpdateProfile.bind(this);
  }

  handleNameChanged(e) {
    this.props.setProfileName(e.target.value);
  }

  handleUpdateProfile(e) {
    e.preventDefault();
    this.props.updateProfile(this.props.name)
  }

  render() {
    // TODO: show correct account status
    let nameClasses = classNames({
      'form-control': true,
      'error': this.props.errorNameEmpty
    });
    return (
      <div>
        <section>
          <form className="form-horizontal">
            <h3 className="form-title">Account</h3>
            <div className="form-group">
              <label htmlFor="email" className="control-label">Email</label>
              <div className="form-control">
                <input
                  type="text"
                  className="textbox textbox-display-only"
                  id="email"
                  value={this.props.email}
                  disabled
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="status" className="control-label">Account status</label>
              <div className="form-control">
                <input
                  type="text"
                  className="textbox textbox-display-only"
                  id="status"
                  value="Normal"
                  disabled
                />
              </div>
            </div>
          </form>
        </section>
        <section>
          <form className="form-horizontal" onSubmit={this.handleUpdateProfile}>
            <h3 className="form-title">Profile</h3>
            <div className="form-group">
              <label className="control-label">Avatar</label>
              <div className="form-control">
                <div id="form-control-avatar">
                  <UserAvatar email={this.props.email} size={48} cornerRadius={48}/>
                </div>
                <div className="form-control-supplement">
                  Insnota gets your avatar from Gravatar. If you would like to change this image, please visit <a
                  href="https://gravatar.com/">https://gravatar.com</a>.
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="name" className="control-label">Name</label>
              <div className={nameClasses}>
                <input
                  type="text"
                  className="textbox"
                  id="name"
                  value={this.props.name}
                  onChange={this.handleNameChanged}
                />
                {this.props.errorNameEmpty &&
                  <div className="form-control-supplement error">
                    The name cannot be blank or contain only whitespaces.
                  </div>
                }
                <div className="form-control-supplement">
                  Your name is public to everyone.
                </div>
              </div>
            </div>
            {this.props.serverErrorProfile &&
              <div className="form-group">
                <label className="control-label" />
                <div className="form-control error">
                  <div className="error">
                    Unable to update your profile due to internal server error. Please try again in a few minutes.
                  </div>
                </div>
              </div>
            }
            {this.props.successProfile &&
              <div className="form-group">
                <label className="control-label" />
                <div className="form-control success">
                  <div className="success">
                    Your profile is updated.
                  </div>
                </div>
              </div>
            }
            <div className="form-submit">
              <input type="submit" className="btn btn-default" value="Update Profile" disabled={this.props.loading} />
            </div>
          </form>
        </section>
      </div>
    );
  }
}

Profile.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  name: React.PropTypes.string,
  email: React.PropTypes.string,
  status: React.PropTypes.string,
  errorNameEmpty: React.PropTypes.bool,
  successProfile: React.PropTypes.bool,
  serverErrorProfile: React.PropTypes.bool,
  setProfileName: React.PropTypes.func.isRequired,
  updateProfile: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.settings;
}

function mapDispatchToProps(dispatch) {
  return {
    setProfileName: name => {
      dispatch(setProfileName(name));
    },
    updateProfile: name => {
      dispatch(updateProfile(name));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
