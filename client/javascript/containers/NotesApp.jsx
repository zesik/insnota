import React from 'react';
import { connect } from 'react-redux';
import { getDocuments, createDocument, changeDocumentTitle } from '../actions/documentManager';
import { openDeleteDocumentModal, closeDeleteDocumentModal, deleteDocument } from '../actions/documentDelete';
import { openPermissionModal } from '../actions/permissionModal';
import { showInformation, showError } from '../actions/notificationCenter';
import { getModeName } from '../utils/editorLanguageModes';
import DocumentManager from '../components/DocumentManager';
import DeleteDocumentModal from '../components/DeleteDocumentModal';
import PermissionModal from './PermissionModal';
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
    this.handleOpenPermissionModal = this.handleOpenPermissionModal.bind(this);
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
        <PermissionModal />
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
