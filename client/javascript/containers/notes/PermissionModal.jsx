import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Modal from '../../components/Modal';
import UserAvatar from '../../components/UserAvatar';
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
} from '../../actions/permissionModal';

class PermissionModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddCollaboratorPlaceholder = this.handleAddCollaboratorPlaceholder.bind(this);
    this.handleStartAddCollaborator = this.handleStartAddCollaborator.bind(this);
    this.handleEditAnonymousEditing = this.handleEditAnonymousEditing.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.editingNewCollaborator !== 'editing' && this.props.editingNewCollaborator === 'editing') {
      this.refs.newCollaborator.focus();
    }
  }

  handleAddCollaboratorPlaceholder(e) {
    e.preventDefault();
    this.props.onAddCollaboratorPlaceholder();
  }

  handleStartAddCollaborator(e) {
    e.preventDefault();
    this.props.onStartAddCollaborator(this.props.newCollaboratorEmail);
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
    let bodyElement;
    if (!this.props.opened) {
      bodyElement = null;
    } else if (this.props.loading) {
      bodyElement = (<div className="modal-body" id="permission-modal-body">Loading...</div>);
    } else {
      const { anonymousEditing, canEdit } = this.props;
      const collaboratorClasses = classNames({
        'form-control': true,
        error: this.props.errorAdding
      });
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
          <div className="modal-body-section form">
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
                <form onSubmit={this.handleStartAddCollaborator}>
                  <div className="collaborator-permission-item new-item">
                    <div className="collaborator-identity">
                      <div className="form-group">
                        <div className={collaboratorClasses}>
                          <input
                            ref="newCollaborator"
                            type="text"
                            className="textbox"
                            value={this.props.newCollaboratorEmail}
                            onChange={e => this.props.onEditCollaboratorPlaceholder(e.target.value)}
                          />
                          {this.props.errorAdding &&
                            <div className="form-control-supplement error">{this.props.errorAdding}</div>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="collaborator-operations">
                      <div className="btn btn-link" onClick={this.handleStartAddCollaborator}>
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
                  onChange={e => this.props.onEditEditorInviting(e.target.checked)}
                />
                Allow collaborators with editing permission to change collaborators
              </label>
            </div>
          </div>
          <div className="modal-body-section-title">Anonymous Editors</div>
          <div className="modal-body-section form">
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
            onConfirm={this.props.onStartSubmitPermission}
            onCancel={this.props.onClosePermissionModal}
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
  errorAdding: React.PropTypes.string,
  newCollaboratorEmail: React.PropTypes.string.isRequired,
  onEditCollaboratorPermission: React.PropTypes.func.isRequired,
  onAddCollaboratorPlaceholder: React.PropTypes.func.isRequired,
  onEditCollaboratorPlaceholder: React.PropTypes.func.isRequired,
  onStartAddCollaborator: React.PropTypes.func.isRequired,
  onCancelAddCollaborator: React.PropTypes.func.isRequired,
  onRemoveCollaborator: React.PropTypes.func.isRequired,
  onEditEditorInviting: React.PropTypes.func.isRequired,
  onEditAnonymousEditing: React.PropTypes.func.isRequired,
  onStartSubmitPermission: React.PropTypes.func.isRequired,
  onClosePermissionModal: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.permissionModal;
}

function mapDispatchToProps(dispatch) {
  return {
    onEditCollaboratorPermission: (email, permission) => {
      dispatch(editCollaboratorPermission(email, permission));
    },
    onAddCollaboratorPlaceholder: () => {
      dispatch(addCollaboratorPlaceholder());
    },
    onEditCollaboratorPlaceholder: email => {
      dispatch(editCollaboratorPlaceholder(email));
    },
    onStartAddCollaborator: email => {
      dispatch(startAddCollaborator(email));
    },
    onCancelAddCollaborator: () => {
      dispatch(cancelAddCollaborator());
    },
    onRemoveCollaborator: email => {
      dispatch(removeCollaborator(email));
    },
    onEditEditorInviting: editorInviting => {
      dispatch(editEditorInviting(editorInviting));
    },
    onEditAnonymousEditing: anonymousEditing => {
      dispatch(editAnonymousEditing(anonymousEditing));
    },
    onStartSubmitPermission: () => {
      dispatch(startSubmitPermission());
    },
    onClosePermissionModal: () => {
      dispatch(closePermissionModal());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermissionModal);
