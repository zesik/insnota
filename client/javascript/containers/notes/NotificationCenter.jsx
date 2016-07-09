import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { removeNotification } from '../../actions/notificationCenter';
import { NOTIFICATION_INFORMATION, NOTIFICATION_WARNING, NOTIFICATION_ERROR } from '../../constants/notifications';

class NotificationCenter extends React.Component {
  constructor(props) {
    super(props);
    this.handleCloseNotification = this.handleCloseNotification.bind(this);
  }

  handleCloseNotification(id) {
    this.props.onCloseNotification(id);
  }

  render() {
    return (
      <div id="notification-container">
        <ReactCSSTransitionGroup
          transitionName="notification-item"
          transitionEnterTimeout={400}
          transitionLeaveTimeout={400}
        >
          {this.props.notifications.map(item => {
            const classes = classNames({
              'notification-item': true,
              'notification-information': item.level === NOTIFICATION_INFORMATION,
              'notification-warning': item.level === NOTIFICATION_WARNING,
              'notification-error': item.level === NOTIFICATION_ERROR
            });
            return (
              <div className={classes} key={item.id}>
                <div className="btn btn-link notification-close" onClick={() => this.handleCloseNotification(item.id)}>
                  <i className="fa fa-times-circle" />
                </div>
                <div className="notification-content">
                  {item.message}
                </div>
              </div>
            );
          })}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

NotificationCenter.propTypes = {
  notifications: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    level: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired
  })).isRequired,
  onCloseNotification: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.notification;
}

function mapDispatchToProps(dispatch) {
  return {
    onCloseNotification: id => {
      dispatch(removeNotification(id));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationCenter);
