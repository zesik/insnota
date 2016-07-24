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
  addCollaborator,
  cancelAddingCollaborator,
  removeCollaborator,
  editEditorInviting,
  editAnonymousEditing,
  submitPermission
} from '../../actions/permissionModal';

class PermissionModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddCollaboratorPlaceholder = this.handleAddCollaboratorPlaceholder.bind(this);
    this.handleAddCollaborator = this.handleAddCollaborator.bind(this);
    this.handleEditAnonymousEditing = this.handleEditAnonymousEditing.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.collaboratorPlaceholderVisible && this.props.collaboratorPlaceholderVisible) {
      this.refs.newCollaborator.focus();
    }
  }

  handleAddCollaboratorPlaceholder(e) {
    e.preventDefault();
    if (this.props.loading) {
      return;
    }
    this.props.onAddCollaboratorPlaceholder();
  }

  handleAddCollaborator(e) {
    e.preventDefault();
    if (this.props.loading) {
      return;
    }
    this.props.onAddCollaborator(this.props.collaboratorPlaceholderEmail);
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
    let bodyElement = null;
    if (this.props.opened) {
      const { anonymousEditing, canEdit, currentUserEmail } = this.props;
      const collaboratorClasses = classNames({
        'form-control': true,
        error: this.props.errorEmailEmpty || this.props.errorEmailInvalid || this.props.errorEmailNotExist ||
          this.props.errorEmailAlreadyExists || this.props.errorEmailIsOwner
      });
      bodyElement = (
        <div>
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
                        disabled={canEdit === 'none' || currentUserEmail === collaborator.email}
                        value={collaborator.permission}
                        onChange={e => this.props.onEditCollaboratorPermission(collaborator.email, e.target.value)}
                      >
                        <option value="view">Can view</option>
                        <option value="edit">Can edit</option>
                      </select>
                    </div>
                    <div className="collaborator-operations">
                      {currentUserEmail === collaborator.email &&
                        <div className="collaborator-self">You</div>
                      }
                      {currentUserEmail !== collaborator.email &&
                        <div
                          className="btn btn-link"
                          onClick={() => this.props.onRemoveCollaborator(collaborator.email)}
                        >
                          <i className="material-icons">remove_circle</i>
                        </div>
                      }
                    </div>
                  </div>
                ))}
                {canEdit !== 'none' && this.props.collaboratorPlaceholderVisible &&
                  <form onSubmit={this.handleAddCollaborator}>
                    <div className="collaborator-permission-item new-item">
                      <div className="collaborator-identity">
                        <div className="form-group">
                          <div className={collaboratorClasses}>
                            <input
                              ref="newCollaborator"
                              type="text"
                              className="textbox collaborator-placeholder"
                              value={this.props.collaboratorPlaceholderEmail}
                              onChange={e => this.props.onEditCollaboratorPlaceholder(e.target.value)}
                            />
                            {this.props.errorEmailEmpty &&
                              <div className="form-control-supplement error">
                                Please type the email address of new collaborator.
                              </div>
                            }
                            {this.props.errorEmailInvalid &&
                              <div className="form-control-supplement error">
                                Please provide a valid email address.
                              </div>
                            }
                            {this.props.errorEmailNotExist &&
                              <div className="form-control-supplement error">
                                This email does not belong to any registered user.
                              </div>
                            }
                            {this.props.errorEmailAlreadyExists &&
                              <div className="form-control-supplement error">
                                A collaborator with this email already exists.
                              </div>
                            }
                            {this.props.errorEmailIsOwner &&
                              <div className="form-control-supplement error">
                                This email address belongs to the note owner.
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                      <div className="collaborator-operations">
                        <div className="btn btn-link" onClick={this.handleAddCollaborator}>
                          <i className="material-icons">done</i>
                        </div>
                        <div className="btn btn-link" onClick={this.props.onCancelAddingCollaborator}>
                          <i className="material-icons">clear</i>
                        </div>
                      </div>
                    </div>
                  </form>
                }
                {canEdit !== 'none' && !this.props.collaboratorPlaceholderVisible &&
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
          {this.props.errorNotFound &&
            <div className="modal-footer error">
              The note no longer exists or you don't have permission to access this note.
            </div>
          }
          {this.props.serverError &&
            <div className="modal-footer error">
              Unable to fulfill your request due to an internal error. Please try again in a few minutes.
            </div>
          }
        </div>
      );
    }
    const cancelButtonTitle = (this.props.canEdit === '' || this.props.canEdit === 'none') ? 'Close' : 'Cancel';
    return (
      <div>
        {this.props.opened &&
          <Modal
            title="Sharing Settings"
            bodyElement={bodyElement}
            confirmButtonTitle="Save"
            confirmButtonHidden={this.props.canEdit === '' || this.props.canEdit === 'none'}
            confirmButtonDisabled={this.props.loading}
            cancelButtonTitle={cancelButtonTitle}
            onConfirm={this.props.onSubmitPermission}
            onCancel={this.props.onClosePermissionModal}
          />
        }
      </div>
    );
  }
}

PermissionModal.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  opened: React.PropTypes.bool.isRequired,
  documentID: React.PropTypes.string.isRequired,
  canEdit: React.PropTypes.string.isRequired,
  ownerName: React.PropTypes.string.isRequired,
  ownerEmail: React.PropTypes.string.isRequired,
  currentUserEmail: React.PropTypes.string,
  collaborators: React.PropTypes.arrayOf(React.PropTypes.shape({
    email: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    permission: React.PropTypes.string.isRequired
  })).isRequired,
  collaboratorPlaceholderVisible: React.PropTypes.bool.isRequired,
  collaboratorPlaceholderEmail: React.PropTypes.string.isRequired,
  editorInviting: React.PropTypes.bool.isRequired,
  anonymousEditing: React.PropTypes.string.isRequired,
  errorNotFound: React.PropTypes.bool.isRequired,
  errorEmailEmpty: React.PropTypes.bool.isRequired,
  errorEmailInvalid: React.PropTypes.bool.isRequired,
  errorEmailNotExist: React.PropTypes.bool.isRequired,
  errorEmailAlreadyExists: React.PropTypes.bool.isRequired,
  errorEmailIsOwner: React.PropTypes.bool.isRequired,
  serverError: React.PropTypes.bool.isRequired,
  onEditCollaboratorPermission: React.PropTypes.func.isRequired,
  onAddCollaboratorPlaceholder: React.PropTypes.func.isRequired,
  onEditCollaboratorPlaceholder: React.PropTypes.func.isRequired,
  onAddCollaborator: React.PropTypes.func.isRequired,
  onCancelAddingCollaborator: React.PropTypes.func.isRequired,
  onRemoveCollaborator: React.PropTypes.func.isRequired,
  onEditEditorInviting: React.PropTypes.func.isRequired,
  onEditAnonymousEditing: React.PropTypes.func.isRequired,
  onSubmitPermission: React.PropTypes.func.isRequired,
  onClosePermissionModal: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return Object.assign({}, state.permissionModal, { currentUserEmail: state.manager.email });
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
    onAddCollaborator: email => {
      dispatch(addCollaborator(email));
    },
    onCancelAddingCollaborator: () => {
      dispatch(cancelAddingCollaborator());
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
    onSubmitPermission: () => {
      dispatch(submitPermission());
    },
    onClosePermissionModal: () => {
      dispatch(closePermissionModal());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermissionModal);
