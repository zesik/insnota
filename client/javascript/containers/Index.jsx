import React from 'react';
import { connect } from 'react-redux';
import { checkVisitorIdentity } from '../actions/home';

class Index extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(checkVisitorIdentity());
  }

  render() {
    return (<div>{this.props.children}</div>);
  }
}

Index.propTypes = {
  dispatch: React.PropTypes.func
};

export default connect(state => state.home)(Index);
