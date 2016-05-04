import React from 'react';
import { connect } from 'react-redux';
import { checkVisitorIdentity } from '../actions/home';

class Index extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(checkVisitorIdentity());
  }

  render() {
    return (
      <div className="app-container">
        <div className="app-content">
          {this.props.children}
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

Index.propTypes = {
  children: React.PropTypes.element.isRequired,
  dispatch: React.PropTypes.func
};

export default connect(state => state.home)(Index);
