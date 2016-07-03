import React from 'react';
import classNames from 'classnames';
import PopupBoxContent from './PopupBoxContent';

class PopupBox extends React.Component {
  constructor(props) {
    super(props);
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.state = {
      visible: false
    };
  }

  toggleVisibility() {
    this.setState({ visible: !this.state.visible });
  }

  render() {
    const popupClasses = classNames({
      'popup-container': true,
      'popup-container-bottom-left': this.props.left
    });
    return (
      <div className={popupClasses}>
        <button className="btn btn-link popup-trigger" onClick={this.toggleVisibility}>
          <i className="fa fa-ellipsis-v" />
        </button>
        {this.state.visible && <div className="popup-backdrop" onClick={this.toggleVisibility} />}
        {this.state.visible &&
          <PopupBoxContent onClose={this.toggleVisibility}>
            {this.props.children}
          </PopupBoxContent>
        }
      </div>
    );
  }
}

PopupBox.propTypes = {
  left: React.PropTypes.bool,
  children: React.PropTypes.element.isRequired
};

export default PopupBox;
