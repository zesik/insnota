import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from '../components/Modal';
import UserAvatar from '../components/UserAvatar';
import {
  closePermissionModal,
  editCollaboratorPermission,
  addCollaboratorPlaceholder,
  editCollaboratorPlaceholder,
  startAddCollaborator,
  cancelAddCollaborator,
  removeCollaborator,
  editEditorInviting,
  editAnonymousEditing,
  startSubmitPermission
} from '../actions/permissionModal';

class PermissionModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleClosePermissionModal = this.handleClosePermissionModal.bind(this);
    this.handleEditCollaboratorPermission = this.handleEditCollaboratorPermission.bind(this);
    this.handleAddCollaboratorPlaceholder = this.handleAddCollaboratorPlaceholder.bind(this);
    this.handleEditCollaboratorPlaceholder = this.handleEditCollaboratorPlaceholder.bind(this);
    this.handleStartAddCollaborator = this.handleStartAddCollaborator.bind(this);
    this.handleCancelAddCollaborator = this.handleCancelAddCollaborator.bind(this);
    this.handleRemoveCollaborator = this.handleRemoveCollaborator.bind(this);
    this.handleEditEditorInviting = this.handleEditEditorInviting.bind(this);
    this.handleEditAnonymousEditing = this.handleEditAnonymousEditing.bind(this);
    this.handleStartSubmitPermission = this.handleStartSubmitPermission.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editingNewCollaborator !== 'editing' && this.props.editingNewCollaborator === 'editing') {
      this.refs.newCollaborator.focus();
    }
  }

  handleClosePermissionModal() {
    const { dispatch } = this.props;
    dispatch(closePermissionModal());
  }

  handleEditCollaboratorPermission(email, permission) {
    const { dispatch } = this.props;
    dispatch(editCollaboratorPermission(email, permission));
  }

  handleAddCollaboratorPlaceholder(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    dispatch(addCollaboratorPlaceholder());
  }

  handleEditCollaboratorPlaceholder(email) {
    const { dispatch } = this.props;
    dispatch(editCollaboratorPlaceholder(email));
  }

  handleStartAddCollaborator(e) {
    const { dispatch } = this.props;
    e.preventDefault();
    dispatch(startAddCollaborator(this.props.newCollaboratorEmail));
  }

  handleCancelAddCollaborator() {
    const { dispatch } = this.props;
    dispatch(cancelAddCollaborator());
  }

  handleRemoveCollaborator(email) {
    const { dispatch } = this.props;
    dispatch(removeCollaborator(email));
  }

  handleEditEditorInviting(editorInviting) {
    const { dispatch } = this.props;
    dispatch(editEditorInviting(editorInviting));
  }

  handleEditAnonymousEditing() {
    const { dispatch } = this.props;
    let anonymousEditing = '';
    if (this.refs.anonymousEditingDeny.checked) {
      anonymousEditing = 'deny';
    } else if (this.refs.anonymousEditingView.checked) {
      anonymousEditing = 'view';
    } else {
      anonymousEditing = 'edit';
    }
    dispatch(editAnonymousEditing(anonymousEditing));
  }

  handleStartSubmitPermission() {
    const { dispatch } = this.props;
    dispatch(startSubmitPermission());
  }

  render() {
    let bodyElement;
    if (!this.props.opened) {
      bodyElement = null;
    } else if (this.props.loading) {
      bodyElement = (<div className="modal-body" id="permission-modal-body">Loading...</div>);
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
              {this.props.collaborators.map(collaborator => (
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
                      onChange={e => this.handleEditCollaboratorPermission(collaborator.email, e.target.value)}
                    >
                      <option value="view">Can view</option>
                      <option value="edit">Can edit</option>
                    </select>
                  </div>
                  <div className="collaborator-operations">
                    <div className="btn btn-link" onClick={() => this.handleRemoveCollaborator(collaborator.email)}>
                      <i className="fa fa-times" />
                    </div>
                  </div>
                </div>
              ))}
              {canEdit !== 'none' && this.props.editingNewCollaborator &&
                <form onSubmit={this.handleStartAddCollaborator}>
                  <div className="collaborator-permission-item new-item">
                    <div className="collaborator-identity">
                      <input
                        ref="newCollaborator"
                        type="text"
                        className="textbox"
                        value={this.props.newCollaboratorEmail}
                        onChange={e => this.handleEditCollaboratorPlaceholder(e.target.value)}
                      />
                    </div>
                    <div className="collaborator-operations">
                      <div className="btn btn-link" onClick={this.handleStartAddCollaborator}>
                        <i className="fa fa-check" />
                      </div>
                      <div className="btn btn-link" onClick={this.handleCancelAddCollaborator}>
                        <i className="fa fa-times" />
                      </div>
                    </div>
                  </div>
                </form>
              }
              {canEdit !== 'none' && !this.props.editingNewCollaborator &&
                <div className="collaborator-permission-item">
                  <a href="" onClick={this.handleAddCollaboratorPlaceholder}>Add collaborator</a>
                </div>
              }
            </div>
            <div className="form-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.editorInviting}
                  disabled={canEdit !== 'owner'}
                  onChange={e => this.handleEditEditorInviting(e.target.checked)}
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
            title="Sharing Settings"
            bodyElement={bodyElement}
            confirmButtonTitle="Save"
            confirmButtonHidden={this.props.loading || this.props.canEdit === 'none'}
            confirmButtonDisabled={this.props.editingNewCollaborator === 'adding'}
            cancelButtonTitle={cancelButtonTitle}
            onCancel={this.handleClosePermissionModal}
            onConfirm={this.handleStartSubmitPermission}
          />
        }
      </div>
    );
  }
}

PermissionModal.propTypes = {
  opened: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string.isRequired,
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
  dispatch: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.permissionModal;
}

export default connect(mapStateToProps)(PermissionModal);

