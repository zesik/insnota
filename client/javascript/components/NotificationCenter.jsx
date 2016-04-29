import React from 'react';

class NotificationCenter extends React.Component {
  render() {
    return (
      <div className="notification-container">
        <div className="notification">
          {this.props.notifications.map(function (item) {
            return (
              <div key={item.id}>
                {item.level}: {item.message}
              </div>
            );
          }, this)}
        </div>
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
