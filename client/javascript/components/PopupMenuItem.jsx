import React from 'react';
import classNames from 'classnames';

class PopupMenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onClose();
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    if (this.props.divider) {
      return (
        <div className="popup-menu-item-divider" />
      );
    }
    const classes = classNames({
      'popup-menu-item': true,
      'popup-menu-item-disabled': this.props.disabled,
      'popup-menu-item-checked': this.props.checked
    });
    if (this.props.disabled) {
      return (
        <div className={classes}>{this.props.text}</div>
      );
    }
    return (
      <a className={classes} href="" onClick={this.handleClick}>{this.props.text}</a>
    );
  }
}

PopupMenuItem.propTypes = {
  text: React.PropTypes.string,
  divider: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  checked: React.PropTypes.bool,
  onClick: React.PropTypes.func,
  onClose: React.PropTypes.func
};

export default PopupMenuItem;
