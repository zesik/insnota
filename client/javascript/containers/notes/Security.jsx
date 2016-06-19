import React from 'react';
import { connect } from 'react-redux';

class Security extends React.Component {
  render() {
    return (
      <div>
        <section>
          <form className="form-horizontal">
            <h3 className="form-title">Password</h3>
            <div className="form-group">
              <label htmlFor="old-password" className="control-label">Old password</label>
              <div className="form-control">
                <input type="password" className="textbox" id="old-password" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="new-password" className="control-label">New password</label>
              <div className="form-control">
                <input type="password" className="textbox" id="new-password" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirm-new-password" className="control-label">Confirm new assword</label>
              <div className="form-control">
                <input type="password" className="textbox" id="confirm-new-password" />
              </div>
            </div>
            <div className="form-submit">
              <input type="submit" className="btn btn-default" value="Change Password" />
            </div>
          </form>
        </section>
      </div>
    );
  }
}

Security.propTypes = {
  dispatch: React.PropTypes.func
};

export default connect(state => state)(Security);
