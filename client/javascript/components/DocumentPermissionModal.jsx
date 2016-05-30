import React from 'react';
import classNames from 'classnames';
import Modal from './Modal';
import UserAvatar from './UserAvatar';

class DocumentPermissionModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddCollaborator = this.handleAddCollaborator.bind(this);
    this.handleConfirmAddCollaborator = this.handleConfirmAddCollaborator.bind(this);
    this.handleEditAnonymousEditing = this.handleEditAnonymousEditing.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editingNewCollaborator !== 'editing' && this.props.editingNewCollaborator === 'editing') {
      this.refs.newCollaborator.focus();
    }
  }

  handleAddCollaborator(e) {
    e.preventDefault();
    this.props.onAddCollaborator();
  }

  handleConfirmAddCollaborator(e) {
    e.preventDefault();
    this.props.onConfirmAddCollaborator(this.props.newCollaboratorEmail);
  }

  handleEditAnonymousEditing() {
    let anonymousEditing = '';
    if (this.refs.anonymousEditingDeny.checked) {
      anonymousEditing = 'deny';
    } else if (this.refs.anonymousEditingView.checked) {
      anonymousEditing = 'view';
    } else {
      anonymousEditing = 'edit';
    }
    this.props.onEditAnonymousEditing(anonymousEditing);
  }

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
    let bodyElement;
    if (this.props.loading) {
      bodyElement = (
        <div className="modal-body" id="permission-modal-body">
          Loading...
        </div>
      );
    } else {
      const { anonymousEditing, canEdit } = this.props;
      bodyElement = (
        <div className="modal-body" id="permission-modal-body">
          <div className="modal-body-section-title">Owner</div>
          <div className="modal-body-section" id="owner-identity-section">
            <UserAvatar email={this.props.ownerEmail} size={32} cornerRadius={32} />
            <div className="owner-identity">
              <div className="name">{this.props.ownerName}</div>
              <div className="email">{this.props.ownerEmail}</div>
            </div>
          </div>
          <div className="modal-body-section-title">Collaborators</div>
          <div className="modal-body-section">
            <div id="collaborator-permission-list" className={classNames({ editable: canEdit !== 'none' })}>
              {this.props.collaborators.map((collaborator, index) => (
                <div className="collaborator-permission-item" key={collaborator.email}>
                  <UserAvatar email={collaborator.email} size={32} cornerRadius={32} />
                  <div className="collaborator-identity">
                    <div className="name">{collaborator.name}</div>
                    <div className="email">{collaborator.email}</div>
                  </div>
                  <div className="collaborator-permission">
                    <select
                      disabled={canEdit === 'none'}
                      value={collaborator.permission}
                      onChange={e => this.props.onEditCollaboratorPermission(collaborator.email, e.target.value)}
                    >
                      <option value="view">Can view</option>
                      <option value="edit">Can edit</option>
                    </select>
                  </div>
                  <div className="collaborator-operations">
                    <div className="btn btn-link" onClick={() => this.props.onRemoveCollaborator(collaborator.email)}>
                      <i className="fa fa-times" />
                    </div>
                  </div>
                </div>
              ))}
              {canEdit !== 'none' && this.props.editingNewCollaborator &&
                <form onSubmit={this.handleConfirmAddCollaborator}>
                  <div className="collaborator-permission-item new-item">
                    <div className="collaborator-identity">
                      <input
                        ref="newCollaborator"
                        type="text"
                        className="textbox"
                        value={this.props.newCollaboratorEmail}
                        onChange={e => this.props.onEditNewCollaborator(e.target.value)}
                      />
                    </div>
                    <div className="collaborator-operations">
                      <div className="btn btn-link" onClick={this.handleConfirmAddCollaborator}>
                        <i className="fa fa-check" />
                      </div>
                      <div className="btn btn-link" onClick={this.props.onCancelAddCollaborator}>
                        <i className="fa fa-times" />
                      </div>
                    </div>
                  </div>
                </form>
              }
              {canEdit !== 'none' && !this.props.editingNewCollaborator &&
                <div className="collaborator-permission-item">
                  <a href="" onClick={this.handleAddCollaborator}>Add collaborator</a>
                </div>
              }
            </div>
            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.editorInviting}
                  disabled={canEdit !== 'owner'}
                  onChange={e => this.props.onEditEditorInviting(e.target.checked)}
                />
                Allow collaborators with editing permission to change collaborators
              </label>
            </div>
          </div>
          <div className="modal-body-section-title">Anonymous Editors</div>
          <div className="modal-body-section">
            <div className="form-checkbox">
              <label>
                <input
                  ref="anonymousEditingDeny"
                  type="radio"
                  name="anonymous-editing"
                  value="deny"
                  checked={anonymousEditing === 'deny'}
                  disabled={canEdit !== 'owner'}
                  onChange={this.handleEditAnonymousEditing}
                />
                Don't allow anonymous editors to access this note
              </label>
            </div>
            <div className="form-checkbox">
              <label>
                <input
                  ref="anonymousEditingView"
                  type="radio"
                  name="anonymous-editing"
                  value="view"
                  checked={anonymousEditing === 'view'}
                  disabled={canEdit !== 'owner'}
                  onChange={this.handleEditAnonymousEditing}
                />
                Allow anonymous editors to view this note
              </label>
            </div>
            <div className="form-checkbox">
              <label>
                <input
                  ref="anonymousEditingEdit"
                  type="radio"
                  name="anonymous-editing"
                  value="edit"
                  checked={anonymousEditing === 'edit'}
                  disabled={canEdit !== 'owner'}
                  onChange={this.handleEditAnonymousEditing}
                />
                Allow anonymous editors to edit this note
              </label>
            </div>
          </div>
        </div>
      );
    }
    const cancelButtonTitle = (this.props.loading || this.props.canEdit === 'none') ? 'Close' : 'Cancel';
    return (
      <div>
        {this.props.opened &&
          <Modal
            titleElement={titleElement}
            bodyElement={bodyElement}
            confirmButtonTitle="Save"
            confirmButtonHidden={this.props.loading || this.props.canEdit === 'none'}
            confirmButtonDisabled={this.props.editingNewCollaborator === 'adding'}
            cancelButtonTitle={cancelButtonTitle}
            onCancel={this.props.onCancel}
            onConfirm={this.props.onConfirm}
          />
        }
      </div>
    );
  }
}

DocumentPermissionModal.propTypes = {
  opened: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
  loading: React.PropTypes.bool.isRequired,
  saving: React.PropTypes.bool.isRequired,
  canEdit: React.PropTypes.string.isRequired,
  ownerName: React.PropTypes.string.isRequired,
  ownerEmail: React.PropTypes.string.isRequired,
  collaborators: React.PropTypes.arrayOf(React.PropTypes.shape({
    email: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    permission: React.PropTypes.string.isRequired
  })).isRequired,
  editorInviting: React.PropTypes.bool.isRequired,
  anonymousEditing: React.PropTypes.string.isRequired,
  editingNewCollaborator: React.PropTypes.string.isRequired,
  newCollaboratorEmail: React.PropTypes.string.isRequired,
  onEditCollaboratorPermission: React.PropTypes.func.isRequired,
  onEditEditorInviting: React.PropTypes.func.isRequired,
  onEditAnonymousEditing: React.PropTypes.func.isRequired,
  onAddCollaborator: React.PropTypes.func.isRequired,
  onEditNewCollaborator: React.PropTypes.func.isRequired,
  onConfirmAddCollaborator: React.PropTypes.func.isRequired,
  onCancelAddCollaborator: React.PropTypes.func.isRequired,
  onRemoveCollaborator: React.PropTypes.func.isRequired,
  onConfirm: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired
};

export default DocumentPermissionModal;
