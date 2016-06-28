import React from 'react';
import { connect } from 'react-redux';

function Layout(props) {
  return (
    <div className="app-container">
      <div className="app-content">
        {props.children}
      </div>
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">&copy; 2016 Yang Liu</div>
        </div>
      </footer>
    </div>
  );
}

Layout.propTypes = {
  children: React.PropTypes.element.isRequired,
  dispatch: React.PropTypes.func
};

export default connect(state => state)(Layout);
