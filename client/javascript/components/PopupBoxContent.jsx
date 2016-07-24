import React from 'react';

class PopupBoxContent extends React.Component {
  constructor(props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    switch (e.keyCode) {
      case 9:   // TAB key
        e.preventDefault();
        break;
      case 27:  // ESC key
        this.props.onClose();
        break;
      default:
        break;
    }
  }

  render() {
    const children = React.Children.map(this.props.children,
      child => React.cloneElement(child, { onClose: this.props.onClose })
    );
    return (
      <div className="popup-content">{children}</div>
    );
  }
}

PopupBoxContent.propTypes = {
  onClose: React.PropTypes.func,
  children: React.PropTypes.element.isRequired
};

export default PopupBoxContent;
