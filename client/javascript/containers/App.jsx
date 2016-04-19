import React from 'react';
import { connect } from 'react-redux';
import { getDocumentList, selectDocument, createDocument, changeDocumentTitle } from '../actions/documentList';
import { showInformation, showError } from '../actions/notificationList';
import { getModeName } from '../utils/editorLanguageModes';
import DocumentList from '../components/DocumentList';
import SyncedEditor, { REMOTE_REMOTE } from '../components/SyncedEditor';
import NotificationList from '../components/NotificationList';

function createWebSocketURL(s = '') {
  const l = window.location;
  return ((l.protocol === 'https:') ? 'wss://' : 'ws://') + l.host + l.pathname + s;
}

class App extends React.Component {
  constructor() {
    super();
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getDocumentList());
  }

  handleLanguageModeChanged(mimeType, remote) {
    const { dispatch } = this.props;
    if (remote === REMOTE_REMOTE) {
      dispatch(showInformation(`Language mode is changed to ${getModeName(mimeType)} by remote user.`));
    }
  }

  render() {
    const { dispatch } = this.props;
    return (
      <div>
        <DocumentList
          loading={this.props.loading}
          selectedDocumentID={this.props.selectedDocumentID}
          documentList={this.props.documentList}
          onNewDocumentClicked={() => dispatch(createDocument('untitled'))}
          onDocumentClicked={documentID => dispatch(selectDocument(documentID))}
        />
        <SyncedEditor
          socketURL={createWebSocketURL()}
          collection="collection"
          documentID={this.props.selectedDocumentID}
          defaultTitle="Untitled"
          defaultContent=""
          defaultMimeType="text/plain"
          onTitleChanged={title => dispatch(changeDocumentTitle(title))}
          onLanguageModeChanged={this.handleLanguageModeChanged}
          onDocumentError={error => dispatch(showError(JSON.stringify(error)))}
        />
        <NotificationList notificationList={this.props.notificationList} />
      </div>
    );
  }
}

App.propTypes = {
  loading: React.PropTypes.bool,
  selectedDocumentID: React.PropTypes.string,
  documentList: React.PropTypes.arrayOf(React.PropTypes.shape({
    documentID: React.PropTypes.string.isRequired,
    selected: React.PropTypes.bool,
    title: React.PropTypes.string,
    lastModified: React.PropTypes.string
  })),
  notificationList: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.number.isRequired,
    level: React.PropTypes.string.isRequired,
    message: React.PropTypes.string.isRequired
  })),
  dispatch: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    loading: state.documentList.loading,
    selectedDocumentID: state.documentList.selectedDocumentID,
    documentList: state.documentList.documentList,
    notificationList: state.notificationList.notificationList
  };
}

export default connect(mapStateToProps)(App);
