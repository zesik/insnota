import React from 'react';
import { connect } from 'react-redux';
import UserAvatar from '../../components/UserAvatar';

class Profile extends React.Component {
  render() {
    return (
      <div>
        <section>
          <form className="form-horizontal">
            <h3 className="form-title">Account</h3>
            <div className="form-group">
              <label htmlFor="email" className="control-label">Email</label>
              <div className="form-control">
                <input type="text" className="textbox textbox-display-only" id="email" disabled />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="status" className="control-label">Account status</label>
              <div className="form-control">
                <input type="text" className="textbox textbox-display-only" id="status" disabled />
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
                <UserAvatar />
                <div className="form-control-supplement">
                  Insnota gets your avatar from Gravatar. If you need to change this image, please visit <a href="https://gravatar.com/">
                  https://gravatar.com</a>.
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="name" className="control-label">Name</label>
              <div className="form-control">
                <input type="text" className="textbox" id="name" />
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
}

Profile.propTypes = {
  dispatch: React.PropTypes.func
};

export default connect(state => state)(Profile);
