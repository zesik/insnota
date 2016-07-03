import React from 'react';

class PopupMenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onClick();
  }

  render() {
    if (this.props.divider) {
      return (
        <li className="popup-menu-item popup-menu-item-divider"/>
      );
    } else if (this.props.disabled) {
      return (
        <li className="popup-menu-item popup-menu-item-disabled">{this.props.text}</li>
      );
    }
    return (
      <li className="popup-menu-item"><a href="" onClick={this.handleClick}>{this.props.text}</a></li>
    );
  }
}

PopupMenuItem.propTypes = {
  text: React.PropTypes.string,
  divider: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  onClick: React.PropTypes.func.isRequired
};

export default PopupMenuItem;
