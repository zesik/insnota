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
    return (
      <div className="popup-content">
        {this.props.children}
      </div>
    );
  }
}

PopupBoxContent.propTypes = {
  onClose: React.PropTypes.func.isRequired,
  children: React.PropTypes.element.isRequired
};

export default PopupBoxContent;
