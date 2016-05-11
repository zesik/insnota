import React from 'react';
import classNames from 'classnames';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleCancel() {
    if (this.props.onCancelClicked) {
      this.props.onCancelClicked();
    }
  }

  handleConfirm(e) {
    e.preventDefault();
    if (this.props.onConfirmClicked) {
      this.props.onConfirmClicked();
    }
  }

  handleKeyDown(e) {
    switch (e.keyCode) {
      case 9:
        e.preventDefault();
        break;
      case 27:
        this.handleCancel();
        break;
    }
  }

  componentDidMount() {
    if (this.props.focusCancelButton) {
      this.refs.cancelButton.focus();
    } else {
      this.refs.defaultButton.focus();
    }
  }

  render() {
    const defaultButtonClasses = classNames({
      btn: true,
      'btn-default': !this.props.defaultButtonDestructive,
      'btn-danger': this.props.defaultButtonDestructive
    });
    return (
      <div className="modal-backdrop">
        <div className="modal-dialog" onKeyDown={this.handleKeyDown}>
          <button className="btn btn-link modal-dialog-close" onClick={this.handleCancel}>
            <i className="fa fa-close" />
          </button>
          {this.props.titleElement ?
            this.props.titleElement :
            <div className="modal-title">{this.props.title}</div>
          }
          {this.props.bodyElement ?
            this.props.bodyElement :
            <div className="modal-body">{this.props.body}</div>
          }
          <div className="modal-buttons" ref="cancelButton">
            <button className="btn" onClick={this.handleCancel}>
              {this.props.cancelButtonTitle || 'Cancel'}
            </button>
            <button className={defaultButtonClasses} onClick={this.handleConfirm} ref="defaultButton">
              {this.props.defaultButtonTitle || 'OK'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  title: React.PropTypes.string,
  body: React.PropTypes.string,
  titleElement: React.PropTypes.element,
  bodyElement: React.PropTypes.element,
  defaultButtonDestructive: React.PropTypes.bool,
  focusCancelButton: React.PropTypes.bool,
  defaultButtonTitle: React.PropTypes.string,
  cancelButtonTitle: React.PropTypes.string,
  onCancelClicked: React.PropTypes.func,
  onConfirmClicked: React.PropTypes.func
};

export default Modal;
