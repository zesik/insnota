import React from 'react';

class NotificationList extends React.Component {
  render() {
    return (
      <div className="notification-container">
        <div className="notification">
          {this.props.notificationList.map(function (item) {
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

NotificationList.propTypes = {
  notificationList: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    level: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired
  }))
};

export default NotificationList;
