import React from 'react';
import { connect } from 'react-redux';
import UserAvatar from '../../components/UserAvatar';
import { setProfileName } from '../../actions/settings';

function Profile(props) {
  let status;
  switch (props.status) {
    case 'unverified':
      status = 'Email address not verified.';
      break;
    default:
      status = 'Unknown';
  }
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
                value={props.email}
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
                value={status}
                disabled
              />
            </div>
          </div>
        </form>
      </section>
      <section>
        <form className="form-horizontal">
          <h3 className="form-title">Profile</h3>
          <div className="form-group">
            <label className="control-label">Avatar</label>
            <div className="form-control">
              <div id="form-control-avatar">
                <UserAvatar email={props.email} size={48} cornerRadius={48} />
              </div>
              <div className="form-control-supplement">
                Insnota gets your avatar from Gravatar. If you would like to change this image, please visit <a href="https://gravatar.com/">
                https://gravatar.com</a>.
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="name" className="control-label">Name</label>
            <div className="form-control">
              <input
                type="text"
                className="textbox"
                id="name"
                value={props.name}
                onChange={e => props.setProfileName(e.target.value)}
              />
              <div className="form-control-supplement">
                Your name is public to everyone.
              </div>
            </div>
          </div>
          <div className="form-submit">
            <input type="submit" className="btn btn-default" value="Update Profile" />
          </div>
        </form>
      </section>
    </div>
  );
}

Profile.propTypes = {
  name: React.PropTypes.string,
  email: React.PropTypes.string,
  status: React.PropTypes.string
};

function mapStateToProps(state) {
  return state.settings;
}

function mapDispatchToProps(dispatch) {
  return {
    setProfileName: name => {
      dispatch(setProfileName(name));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
