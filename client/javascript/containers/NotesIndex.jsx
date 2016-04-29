import React from 'react';
import { connect } from 'react-redux';

function Index({ children }) {
  return (<div>{children}</div>);
}

export default connect(state => state)(Index);
