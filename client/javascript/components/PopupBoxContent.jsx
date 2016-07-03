import React from 'react';

class PopupBoxContent extends React.Component {
  render() {
    return (
      <div className="popup-content">
        {this.props.children}
      </div>
    );
  }
}

export default PopupBoxContent;
