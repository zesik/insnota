import React from 'react';
import { Link } from 'react-router';

class Settings extends React.Component {
  render() {
    return (
      <div className="app-container">
        <header className="app-title">
          <h1 className="container">Settings</h1>
        </header>
        <nav className="app-navigation">
          <div className="container">
            <Link to="/settings/profile" className="navigation-tab" activeClassName="navigation-tab-active">
              Profile
            </Link>
            <Link to="/settings/security" className="navigation-tab" activeClassName="navigation-tab-active">
              Security
            </Link>
          </div>
        </nav>
        <div className="app-content">
          <div className="container">
            {this.props.children}
          </div>
        </div>
        <footer className="app-footer">
          <div className="container">
            <div className="footer-content">&copy; 2016 Yang Liu</div>
          </div>
        </footer>
      </div>
    );
  }
}

export default Settings;
