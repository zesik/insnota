import React from 'react';
import { connect } from 'react-redux';

function Index({ children }) {
  return (<div className="full-screen-app">{children}</div>);
}

export default connect(state => state)(Index);
