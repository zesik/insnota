import React from 'react';
import classNames from 'classnames';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { NOTIFICATION_INFORMATION, NOTIFICATION_WARNING, NOTIFICATION_ERROR } from '../constants/notificationLevels';

class NotificationCenter extends React.Component {
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
                {item.message}
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
  }))
};

export default NotificationCenter;
