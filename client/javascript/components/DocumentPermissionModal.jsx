import React from 'react';
import Modal from './Modal';

class DocumentPermissionModal extends React.Component {
  render() {
    let titleElement;
    if (this.props.title) {
      titleElement = (
        <div className="modal-title">
          Sharing Settings for <strong>{this.props.title}</strong>
        </div>
      );
    } else {
      titleElement = (<div className="modal-title">Sharing Settings</div>);
    }

    const bodyElement = (
      <div className="modal-body" id="permission-modal-body">
        <div className="modal-body-section-title">Owner</div>
        <div className="modal-body-section">
          Me
        </div>
        <div className="modal-body-section-title">Collaborators</div>
        <div className="modal-body-section">
          <div className="form-checkbox">
            <label>
              <input type="checkbox" />
              Allow collaborators to change share settings of this note
            </label>
          </div>
          <div id="collaborator-permission-list">
            <div className="collaborator-permission-item">
              <a href="">Add collaborator</a>
            </div>
          </div>
        </div>
        <div className="modal-body-section-title">Anonymous Editors</div>
        <div className="modal-body-section">
          <div className="form-checkbox">
            <label>
              <input type="radio" name="anonymous-editing" value="deny"/>
              Don't allow anonymous editors
            </label>
          </div>
          <div className="form-checkbox">
            <label>
              <input type="radio" name="anonymous-editing" value="view" />
              Allow anonymous editors to view this note
            </label>
          </div>
          <div className="form-checkbox">
            <label>
              <input type="radio" name="anonymous-editing" value="edit" />
              Allow anonymous editors to edit this note
            </label>
          </div>
        </div>
      </div>
    );
    return (
      <div>
        {this.props.visible &&
          <Modal
            titleElement={titleElement}
            bodyElement={bodyElement}
            confirmButtonTitle="Save"
            onCancelClicked={this.props.onCancelClicked}
          />
        }
      </div>
    );
  }
}

DocumentPermissionModal.propTypes = {
  visible: React.PropTypes.bool.isRequired,
  title: React.PropTypes.string.isRequired,
  anonymousEditing: React.PropTypes.string.isRequired,
  onConfirmClicked: React.PropTypes.func.isRequired,
  onCancelClicked: React.PropTypes.func.isRequired
};

export default DocumentPermissionModal;
