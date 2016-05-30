import React from 'react';
import { connect } from 'react-redux';
import { getDocuments, createDocument, changeDocumentTitle } from '../actions/documentManager';
import { openDeleteDocumentModal, closeDeleteDocumentModal, deleteDocument } from '../actions/documentDelete';
import {
  openPermissionModal,
  closePermissionModal,
  editCollaboratorPermission,
  editEditorInviting,
  editAnonymousEditing,
  addCollaboratorPlaceholder,
  editCollaboratorPlaceholder,
  startAddCollaborator,
  cancelAddCollaborator,
  removeCollaborator
} from '../actions/documentPermission';
import { showInformation, showError } from '../actions/notificationCenter';
import { getModeName } from '../utils/editorLanguageModes';
import DocumentManager from '../components/DocumentManager';
import DeleteDocumentModal from '../components/DeleteDocumentModal';
import DocumentPermissionModal from '../components/DocumentPermissionModal';
import SyncedEditor, { REMOTE_REMOTE } from '../components/SyncedEditor';
import NotificationCenter from '../components/NotificationCenter';

const COLLECTION_NAME = 'collection';

function createWebSocketURL() {
  const l = window.location;
  return `${((l.protocol === 'https:') ? 'wss://' : 'ws://')}${l.host}/notes`;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
    this.handleTitleChanged = this.handleTitleChanged.bind(this);
    this.handleDeleteDocument = this.handleDeleteDocument.bind(this);

    // Permission modal
    this.handleOpenPermissionModal = this.handleOpenPermissionModal.bind(this);
    this.handleClosePermissionModal = this.handleClosePermissionModal.bind(this);
    this.handleEditCollaboratorPermission = this.handleEditCollaboratorPermission.bind(this);
    this.handleEditEditorInviting = this.handleEditEditorInviting.bind(this);
    this.handleEditAnonymousEditing = this.handleEditAnonymousEditing.bind(this);
    this.handleAddCollaborator = this.handleAddCollaborator.bind(this);
    this.handleEditNewCollaborator = this.handleEditNewCollaborator.bind(this);
    this.handleConfirmAddCollaborator = this.handleConfirmAddCollaborator.bind(this);
    this.handleCancelAddCollaborator = this.handleCancelAddCollaborator.bind(this);
    this.handleRemoveCollaborator = this.handleRemoveCollaborator.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getDocuments());
  }

  handleLanguageModeChanged(mimeType, remote) {
    const { dispatch } = this.props;
    if (remote === REMOTE_REMOTE) {
      dispatch(showInformation(`Language mode is changed to ${getModeName(mimeType)} by remote user.`));
    }
  }

  handleTitleChanged(newTitle) {
    const { dispatch, selectedDocumentID } = this.props;
    dispatch(changeDocumentTitle(selectedDocumentID, newTitle));
  }

  handleDeleteDocument(documentID) {
    const { dispatch, selectedDocumentID } = this.props;
    dispatch(deleteDocument(documentID, selectedDocumentID === documentID));
  }

  handleOpenPermissionModal(documentID) {
    const { dispatch } = this.props;
    dispatch(openPermissionModal(documentID));
  }

  handleClosePermissionModal() {
    const { dispatch } = this.props;
    dispatch(closePermissionModal());
  }

  handleEditCollaboratorPermission(email, permission) {
    const { dispatch } = this.props;
    dispatch(editCollaboratorPermission(email, permission));
  }

  handleEditEditorInviting(editorInviting) {
    const { dispatch } = this.props;
    dispatch(editEditorInviting(editorInviting));
  }

  handleEditAnonymousEditing(anonymousEditing) {
    const { dispatch } = this.props;
    dispatch(editAnonymousEditing(anonymousEditing));
  }

  handleAddCollaborator() {
    const { dispatch } = this.props;
    dispatch(addCollaboratorPlaceholder());
  }

  handleEditNewCollaborator(email) {
    const { dispatch } = this.props;
    dispatch(editCollaboratorPlaceholder(email));
  }

  handleConfirmAddCollaborator(email) {
    const { dispatch } = this.props;
    dispatch(startAddCollaborator(email));
  }

  handleCancelAddCollaborator() {
    const { dispatch } = this.props;
    dispatch(cancelAddCollaborator());
  }

  handleRemoveCollaborator(email) {
    const { dispatch } = this.props;
    dispatch(removeCollaborator(email));
  }

  render() {
    const { dispatch, userName, userEmail } = this.props;
    let currentUser = null;
    if (userEmail) {
      currentUser = { name: userName, email: userEmail };
    }
    return (
      <div className="full-size">
        <DocumentManager
          collapsed={!this.props.userEmail}
          fetching={this.props.fetchingDocuments}
          currentUser={currentUser}
          documents={this.props.documents}
          selectedDocumentID={this.props.selectedDocumentID}
          onNewDocumentClicked={() => dispatch(createDocument())}
          onDeleteDocumentClicked={(documentID, title) => dispatch(openDeleteDocumentModal(documentID, title))}
        />
        <SyncedEditor
          fullScreen={!this.props.userEmail}
          socketURL={createWebSocketURL()}
          collection={COLLECTION_NAME}
          documentID={this.props.selectedDocumentID}
          onTitleChanged={this.handleTitleChanged}
          onLanguageModeChanged={this.handleLanguageModeChanged}
          onDocumentError={error => dispatch(showError(JSON.stringify(error)))}
          onOpenPermissionModal={documentID => dispatch(openPermissionModal(documentID))}
        />
        <DeleteDocumentModal
          opened={this.props.modalDeleteDocument.opened}
          documentID={this.props.modalDeleteDocument.documentID}
          documentTitle={this.props.modalDeleteDocument.title}
          onConfirm={this.handleDeleteDocument}
          onCancel={() => dispatch(closeDeleteDocumentModal())}
        />
        <DocumentPermissionModal
          opened={this.props.modalDocumentPermission.opened}
          documentID={this.props.modalDocumentPermission.documentID}
          title={this.props.modalDocumentPermission.title}
          loading={this.props.modalDocumentPermission.loading}
          saving={this.props.modalDocumentPermission.saving}
          canEdit={this.props.modalDocumentPermission.canEdit}
          ownerName={this.props.modalDocumentPermission.ownerName}
          ownerEmail={this.props.modalDocumentPermission.ownerEmail}
          collaborators={this.props.modalDocumentPermission.collaborators}
          editorInviting={this.props.modalDocumentPermission.editorInviting}
          anonymousEditing={this.props.modalDocumentPermission.anonymousEditing}
          editingNewCollaborator={this.props.modalDocumentPermission.editingNewCollaborator}
          newCollaboratorEmail={this.props.modalDocumentPermission.newCollaboratorEmail}
          onEditCollaboratorPermission={this.handleEditCollaboratorPermission}
          onEditEditorInviting={this.handleEditEditorInviting}
          onEditAnonymousEditing={this.handleEditAnonymousEditing}
          onAddCollaborator={this.handleAddCollaborator}
          onEditNewCollaborator={this.handleEditNewCollaborator}
          onConfirmAddCollaborator={this.handleConfirmAddCollaborator}
          onCancelAddCollaborator={this.handleCancelAddCollaborator}
          onRemoveCollaborator={this.handleRemoveCollaborator}
          onCancel={this.handleClosePermissionModal}
        />
        <NotificationCenter notifications={this.props.notifications} />
      </div>
    );
  }
}

App.propTypes = {
  fetchingDocuments: React.PropTypes.bool,
  creatingDocuments: React.PropTypes.bool,
  userName: React.PropTypes.string,
  userEmail: React.PropTypes.string,
  documents: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    lastModified: React.PropTypes.string
  })),
  selectedDocumentID: React.PropTypes.string,
  modalDeleteDocument: React.PropTypes.shape({
    opened: React.PropTypes.bool.isRequired,
    documentID: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    deleting: React.PropTypes.bool.isRequired
  }).isRequired,
  modalDocumentPermission: React.PropTypes.shape({
    opened: React.PropTypes.bool.isRequired,
    documentID: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    loading: React.PropTypes.bool.isRequired,
    saving: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    canEdit: React.PropTypes.string,
    ownerName: React.PropTypes.string.isRequired,
    ownerEmail: React.PropTypes.string.isRequired,
    collaborators: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      email: React.PropTypes.string.isRequired,
      permission: React.PropTypes.string.isRequired
    })).isRequired,
    editorInviting: React.PropTypes.bool.isRequired,
    anonymousEditing: React.PropTypes.string.isRequired,
    editingNewCollaborator: React.PropTypes.string.isRequired,
    newCollaboratorEmail: React.PropTypes.string.isRequired
  }).isRequired,
  notifications: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    level: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired
  })),
  dispatch: React.PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    fetchingDocuments: state.document.fetchingDocuments,
    creatingDocuments: state.document.creatingDocuments,
    userName: state.document.userName,
    userEmail: state.document.userEmail,
    documents: state.document.documents,
    selectedDocumentID: ownProps.params.splat,
    modalDeleteDocument: state.deleteModal,
    modalDocumentPermission: state.permissionModal,
    notifications: state.notification.notifications
  };
}

export default connect(mapStateToProps)(App);
