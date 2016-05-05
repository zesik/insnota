import React from 'react';
import { connect } from 'react-redux';

function Index({ children }) {
  return (<div className="full-size">{children}</div>);
}

Index.propTypes = {
  children: React.PropTypes.element.isRequired
};

export default connect(state => state)(Index);
