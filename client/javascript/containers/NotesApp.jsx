import React from 'react';
import { connect } from 'react-redux';
import { getDocuments, createDocument, changeDocumentTitle, deleteDocument } from '../actions/documentManager';
import { showInformation, showError } from '../actions/notificationCenter';
import { getModeName } from '../utils/editorLanguageModes';
import DocumentManager from '../components/DocumentManager';
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

  render() {
    const { dispatch, userName, userEmail } = this.props;
    let currentUser = null;
    if (userEmail) {
      currentUser = { name: userName, email: userEmail };
    }
    return (
      <div className="full-size">
        <DocumentManager
          fetching={this.props.fetchingDocuments}
          currentUser={currentUser}
          documents={this.props.documents}
          selectedDocumentID={this.props.selectedDocumentID}
          onNewDocumentClicked={() => dispatch(createDocument())}
          onDeleteDocumentClicked={(documentID, isOpened) => dispatch(deleteDocument(documentID, isOpened))}
        />
        <SyncedEditor
          socketURL={createWebSocketURL()}
          collection={COLLECTION_NAME}
          documentID={this.props.selectedDocumentID}
          onTitleChanged={this.handleTitleChanged}
          onLanguageModeChanged={this.handleLanguageModeChanged}
          onDocumentError={error => dispatch(showError(JSON.stringify(error)))}
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
    notifications: state.notification.notifications
  };
}

export default connect(mapStateToProps)(App);