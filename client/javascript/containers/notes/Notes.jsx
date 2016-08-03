import React from 'react';
import { connect } from 'react-redux';
import NotificationSystem, { showInformation, showError } from 're-alert';
import { changeDocumentTitle, toggleFullScreen, togglePreview } from '../../actions/documentManager';
import { openPermissionModal } from '../../actions/permissionModal';
import { getModeName } from '../../utils/editorLanguageModes';
import DocumentManager from './DocumentManager';
import SyncedEditor, { OP_REMOTE } from '../../components/SyncedEditor';
import PermissionModal from './PermissionModal';
import DeleteModal from './DeleteModal';

const NOTIFICATION_INFO_DELAY = 10000;
const NOTIFICATION_ERROR_DELAY = 20000;

class Notes extends React.Component {
  constructor(props) {
    super(props);
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
    this.handleTitleChanged = this.handleTitleChanged.bind(this);
    this.handleOpenPermissionModal = this.handleOpenPermissionModal.bind(this);
  }

  componentDidMount() {
    document.title = 'Insnota';
  }

  handleLanguageModeChanged(mimeType, remote) {
    const { dispatch } = this.props;
    if (remote === OP_REMOTE) {
      dispatch(showInformation(`Language mode is changed to ${getModeName(mimeType)} by remote user.`,
        NOTIFICATION_INFO_DELAY));
    }
  }

  handleTitleChanged(newTitle) {
    const { dispatch, selectedDocumentID } = this.props;
    dispatch(changeDocumentTitle(selectedDocumentID, newTitle));
  }

  handleOpenPermissionModal(documentID) {
    const { dispatch } = this.props;
    dispatch(openPermissionModal(documentID));
  }

  render() {
    const { dispatch, user } = this.props;
    return (
      <div id="editor-container" className="full-size">
        <DocumentManager visible={!this.props.fullScreen} selectedDocumentID={this.props.selectedDocumentID} />
        <SyncedEditor
          user={user}
          fullScreen={!user || this.props.fullScreen}
          previewVisible={this.props.previewVisible}
          documentID={this.props.selectedDocumentID}
          onTitleChanged={this.handleTitleChanged}
          onLanguageModeChanged={this.handleLanguageModeChanged}
          onDocumentError={error => dispatch(showError(JSON.stringify(error), NOTIFICATION_ERROR_DELAY))}
          onOpenPermissionModal={documentID => dispatch(openPermissionModal(documentID))}
          onToggleFullScreen={() => dispatch(toggleFullScreen())}
          onTogglePreview={() => dispatch(togglePreview())}
        />
        <DeleteModal selectedDocumentID={this.props.selectedDocumentID} />
        <PermissionModal />
        <NotificationSystem customClassName="notification-drop-shadow" />
      </div>
    );
  }
}

Notes.propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string,
    email: React.PropTypes.string
  }),
  selectedDocumentID: React.PropTypes.string,
  previewVisible: React.PropTypes.bool.isRequired,
  fullScreen: React.PropTypes.bool.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  const user = state.manager.email ? { name: state.manager.name, email: state.manager.email } : null;
  return {
    user,
    previewVisible: state.manager.previewVisible,
    fullScreen: state.manager.fullScreen,
    selectedDocumentID: ownProps.params.id
  };
}

export default connect(mapStateToProps)(Notes);
