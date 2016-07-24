import React from 'react';
import classNames from 'classnames';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentDidMount() {
    if (this.props.cancelButtonFocused || this.props.confirmButtonHidden) {
      this.refs.cancelButton.focus();
    } else {
      this.refs.confirmButton.focus();
    }
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleCancel() {
    if (this.props.cancelButtonDisabled) {
      return;
    }
    this.props.onCancel();
  }

  handleConfirm(e) {
    e.preventDefault();
    this.props.onConfirm();
  }

  handleKeyDown(e) {
    let element = e.target;
    switch (e.keyCode) {
      case 9:   // TAB key
        if (element === this.refs.closeButton && e.shiftKey) {
          e.preventDefault();
          this.refs.confirmButton.focus();
        } else if (element === this.refs.confirmButton && !e.shiftKey) {
          e.preventDefault();
          this.refs.closeButton.focus();
        } else {
          // Keep focus inside the dialog
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
      case 27:  // ESC key
        this.handleCancel();
        break;
      default:
        break;
    }
  }

  render() {
    const defaultButtonClasses = classNames({
      btn: true,
      'btn-default': !this.props.confirmButtonDestructive,
      'btn-danger': this.props.confirmButtonDestructive
    });
    const titleElement = this.props.titleElement ? this.props.titleElement :
      (<div className="modal-title">{this.props.title}</div>);
    const bodyElement = this.props.bodyElement ? this.props.bodyElement :
      (<div className="modal-body">{this.props.body}</div>);
    return (
      <div className="modal-backdrop">
        <div className="modal-dialog" ref="dialog">
          <button
            className="btn btn-link modal-dialog-close"
            onClick={this.handleCancel}
            disabled={this.props.cancelButtonDisabled}
            ref="closeButton"
          >
            <i className="material-icons">close</i>
          </button>
          {titleElement}
          {bodyElement}
          <div className="modal-buttons">
            <button
              className="btn"
              onClick={this.handleCancel}
              disabled={this.props.cancelButtonDisabled}
              ref="cancelButton"
            >
              {this.props.cancelButtonTitle || 'Cancel'}
            </button>
            {!this.props.confirmButtonHidden &&
              <button
                className={defaultButtonClasses}
                onClick={this.handleConfirm}
                disabled={this.props.confirmButtonDisabled}
                ref="confirmButton"
              >
                {this.props.confirmButtonTitle || 'OK'}
              </button>
            }
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
  confirmButtonTitle: React.PropTypes.string,
  confirmButtonDestructive: React.PropTypes.bool,
  confirmButtonDisabled: React.PropTypes.bool,
  confirmButtonHidden: React.PropTypes.bool,
  cancelButtonTitle: React.PropTypes.string,
  cancelButtonFocused: React.PropTypes.bool,
  cancelButtonDisabled: React.PropTypes.bool,
  onConfirm: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};

export default Modal;
