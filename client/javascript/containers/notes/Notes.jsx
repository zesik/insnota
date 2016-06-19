import React from 'react';
import { connect } from 'react-redux';
import { changeDocumentTitle } from '../../actions/documentManager';
import { openPermissionModal } from '../../actions/permissionModal';
import { showInformation, showError } from '../../actions/notificationCenter';
import { getModeName } from '../../utils/editorLanguageModes';
import DocumentManager from './DocumentManager';
import SyncedEditor, { OP_REMOTE } from '../../components/SyncedEditor';
import PermissionModal from './PermissionModal';
import DeleteModal from './DeleteModal';
import NotificationCenter from './NotificationCenter';

class Notes extends React.Component {
  constructor(props) {
    super(props);
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
    this.handleTitleChanged = this.handleTitleChanged.bind(this);
    this.handleOpenPermissionModal = this.handleOpenPermissionModal.bind(this);
  }

  handleLanguageModeChanged(mimeType, remote) {
    const { dispatch } = this.props;
    if (remote === OP_REMOTE) {
      dispatch(showInformation(`Language mode is changed to ${getModeName(mimeType)} by remote user.`));
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
      <div className="full-size">
        <DocumentManager selectedDocumentID={this.props.selectedDocumentID} />
        <SyncedEditor
          user={user}
          fullScreen={!user}
          documentID={this.props.selectedDocumentID}
          onTitleChanged={this.handleTitleChanged}
          onLanguageModeChanged={this.handleLanguageModeChanged}
          onDocumentError={error => dispatch(showError(JSON.stringify(error)))}
          onOpenPermissionModal={documentID => dispatch(openPermissionModal(documentID))}
        />
        <DeleteModal selectedDocumentID={this.props.selectedDocumentID} />
        <PermissionModal />
        <NotificationCenter />
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
  dispatch: React.PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  const user = state.manager.email ? { name: state.manager.name, email: state.manager.email } : null;
  return {
    user,
    selectedDocumentID: ownProps.params.id
  };
}

export default connect(mapStateToProps)(Notes);
