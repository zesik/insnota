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
    let element = e.target;
    switch (e.keyCode) {
      case 9:
        if (element === this.refs.closeButton && e.shiftKey) {
          e.preventDefault();
          this.refs.confirmButton.focus();
        } else if (element === this.refs.confirmButton && !e.shiftKey) {
          e.preventDefault();
          this.refs.closeButton.focus();
        } else {
          while (element && element !== this.refs.dialog) {
            element = element.parentNode;
          }
          if (!element) {
            e.preventDefault();
            if (e.shiftKey) {
              this.refs.confirmButton.focus();
            } else {
              this.refs.closeButton.focus();
            }
          }
        }
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
      this.refs.confirmButton.focus();
    }
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  render() {
    const defaultButtonClasses = classNames({
      btn: true,
      'btn-default': !this.props.defaultButtonDestructive,
      'btn-danger': this.props.defaultButtonDestructive
    });
    return (
      <div className="modal-backdrop">
        <div className="modal-dialog" ref="dialog">
          <button className="btn btn-link modal-dialog-close" onClick={this.handleCancel} ref="closeButton">
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
            <button className={defaultButtonClasses} onClick={this.handleConfirm} ref="confirmButton">
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
