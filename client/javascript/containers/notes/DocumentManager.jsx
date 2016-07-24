import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Document from '../../components/Document';
import UserAvatar from '../../components/UserAvatar';
import PopupBox from '../../components/PopupBox';
import PopupMenu from '../../components/PopupMenu';
import PopupMenuItem from '../../components/PopupMenuItem';
import {
  initializeManager,
  createDocument,
  navigateToSettings,
  signOut,
  changeSortingOrder,
  toggleShowOwnedDocuments,
  toggleShowSharedDocuments
} from '../../actions/documentManager';
import { openDeleteModal } from '../../actions/deleteModal';
import {
  SORTING_CREATE_TIME_ASCENDING,
  SORTING_CREATE_TIME_DESCENDING,
  SORTING_TITLE_ASCENDING,
  SORTING_TITLE_DESCENDING
} from '../../constants/documentManager';

function textifyNoteCounter(count) {
  switch (count) {
    case 0:
      return 'No notes';
    case 1:
      return '1 note';
    default:
      return `${count} notes`;
  }
}

class DocumentManager extends React.Component {
  constructor(props) {
    super(props);
    this.handleNewDocumentClicked = this.handleNewDocumentClicked.bind(this);
    this.handleDeleteDocumentClicked = this.handleDeleteDocumentClicked.bind(this);
    this.handleNavigateToSettingsClicked = this.handleNavigateToSettingsClicked.bind(this);
    this.handleSignOutClicked = this.handleSignOutClicked.bind(this);
    this.handleChangeSortingOrder = this.handleChangeSortingOrder.bind(this);
    this.handleToggleShowOwnedDocuments = this.handleToggleShowOwnedDocuments.bind(this);
    this.handleToggleShowSharedDocuments = this.handleToggleShowSharedDocuments.bind(this);
  }

  componentDidMount() {
    this.props.initializeManager();
  }

  handleNewDocumentClicked() {
    const { loading, creating, onNewDocumentClicked } = this.props;
    if (loading || creating) {
      return;
    }
    onNewDocumentClicked();
  }

  handleDeleteDocumentClicked(e, documentID, title) {
    e.preventDefault();
    this.props.onDeleteDocumentClicked(documentID, title);
  }

  handleNavigateToSettingsClicked() {
    this.props.onNavigateToSettingsClicked();
  }

  handleSignOutClicked() {
    this.props.onSignOutClicked();
  }

  handleChangeSortingOrder(order) {
    this.props.onChangeSortingOrder(order);
  }

  handleToggleShowOwnedDocuments() {
    this.props.onToggleShowOwnedDocuments();
  }

  handleToggleShowSharedDocuments() {
    this.props.onToggleShowSharedDocuments();
  }

  render() {
    const newDocClasses = classNames({
      btn: true,
      'btn-link': true,
      'tool-bar-item': true,
      'icon-button': true,
      disabled: this.props.loading || this.props.creating
    });
    const containerClasses = classNames({
      'document-list-container': true,
      collapsed: this.props.collapsed
    });
    return (
      <div className={containerClasses}>
        <div className="document-list-header">
          {this.props.user &&
            <div className="document-list-header-content-container">
              <UserAvatar email={this.props.user.email} size={32} cornerRadius={32} />
              <div className="user-info">
                <div className="user-name">{this.props.user.name}</div>
                <div className="user-email">{this.props.user.email}</div>
              </div>
              <div className="account-menu">
                <PopupBox>
                  <PopupMenu>
                    <PopupMenuItem text="Settings" onClick={this.handleNavigateToSettingsClicked} />
                    <PopupMenuItem text="Sign out" onClick={this.handleSignOutClicked} />
                  </PopupMenu>
                </PopupBox>
              </div>
            </div>
          }
        </div>
        <div className="document-list-status tool-bar">
          <div className="tool-bar-item">
            {this.props.loading && <div className="loading">Loading...</div>}
            {!this.props.loading && <div>{textifyNoteCounter(this.props.documents.length)}</div>}
          </div>
          <div className="tool-bar-item flex-width" />
          {this.props.showingOwned &&
            <button className={newDocClasses} onClick={this.handleNewDocumentClicked}>
              <i className="fa fa-plus" />
            </button>
          }
          <div className="tool-bar-item icon-button">
            <PopupBox>
              <PopupMenu>
                <PopupMenuItem text="Show Notes" disabled />
                <PopupMenuItem
                  text="Created by Me"
                  checked={this.props.showingOwned}
                  onClick={this.handleToggleShowOwnedDocuments}
                />
                <PopupMenuItem
                  text="Shared to Me"
                  checked={this.props.showingShared}
                  onClick={this.handleToggleShowSharedDocuments}
                />
                <PopupMenuItem divider />
                <PopupMenuItem text="Sort By" disabled />
                <PopupMenuItem
                  text="Date Created (oldest first)"
                  checked={this.props.sorting === SORTING_CREATE_TIME_ASCENDING}
                  onClick={() => this.handleChangeSortingOrder(SORTING_CREATE_TIME_ASCENDING)}
                />
                <PopupMenuItem
                  text="Date Created (newest first)"
                  checked={this.props.sorting === SORTING_CREATE_TIME_DESCENDING}
                  onClick={() => this.handleChangeSortingOrder(SORTING_CREATE_TIME_DESCENDING)}
                />
                <PopupMenuItem
                  text="Title (ascending)"
                  checked={this.props.sorting === SORTING_TITLE_ASCENDING}
                  onClick={() => this.handleChangeSortingOrder(SORTING_TITLE_ASCENDING)}
                />
                <PopupMenuItem
                  text="Title (descending)"
                  checked={this.props.sorting === SORTING_TITLE_DESCENDING}
                  onClick={() => this.handleChangeSortingOrder(SORTING_TITLE_DESCENDING)}
                />
              </PopupMenu>
            </PopupBox>
          </div>
        </div>
        <div className="document-list">
          {this.props.documents.length === 0 && this.props.showingOwned &&
            <div className="document-empty-tip tip-creating-new">
              You don't have any notes. Click the plus sign to create a new note.
            </div>
          }
          {this.props.documents.length === 0 && !this.props.showingOwned &&
            <div className="document-empty-tip tip-switching">
              No note is visible. Click the more icon to show your own notes.
            </div>
          }
          {this.props.documents.map(item =>
            <Document
              id={item.id}
              selected={item.id === this.props.selectedDocumentID}
              title={item.title}
              createTime={item.createTime}
              access={item.access}
              onDeleteClicked={e => this.handleDeleteDocumentClicked(e, item.id, item.title)}
            />
          )}
        </div>
      </div>
    );
  }
}

DocumentManager.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  creating: React.PropTypes.bool.isRequired,
  showingOwned: React.PropTypes.bool.isRequired,
  showingShared: React.PropTypes.bool.isRequired,
  sorting: React.PropTypes.string.isRequired,
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired
  }),
  documents: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    createTime: React.PropTypes.string.isRequired,
    access: React.PropTypes.string.isRequired
  })).isRequired,
  selectedDocumentID: React.PropTypes.string,
  collapsed: React.PropTypes.bool.isRequired,
  initializeManager: React.PropTypes.func.isRequired,
  onNewDocumentClicked: React.PropTypes.func.isRequired,
  onDeleteDocumentClicked: React.PropTypes.func.isRequired,
  onNavigateToSettingsClicked: React.PropTypes.func.isRequired,
  onSignOutClicked: React.PropTypes.func.isRequired,
  onChangeSortingOrder: React.PropTypes.func.isRequired,
  onToggleShowOwnedDocuments: React.PropTypes.func.isRequired,
  onToggleShowSharedDocuments: React.PropTypes.func.isRequired
};

function getDocuments(documents, showingOwned, showingShared, sorting) {
  let sortingFunction;
  switch (sorting) {
    case SORTING_CREATE_TIME_ASCENDING:
      sortingFunction = (a, b) => a.createTime.localeCompare(b.createTime);
      break;
    case SORTING_CREATE_TIME_DESCENDING:
      sortingFunction = (a, b) => -a.createTime.localeCompare(b.createTime);
      break;
    case SORTING_TITLE_ASCENDING:
      sortingFunction = (a, b) => a.title.localeCompare(b.title);
      break;
    case SORTING_TITLE_DESCENDING:
      sortingFunction = (a, b) => -a.title.localeCompare(b.title);
      break;
    default:
      sortingFunction = null;
      break;
  }
  const docs = documents.filter(doc =>
    (showingOwned && doc.access === 'owner') ||
    (showingShared && (doc.access === 'viewable' || doc.access === 'editable'))
  );
  docs.sort((a, b) => -a.createTime.localeCompare(b.createTime));
  if (sortingFunction) {
    docs.sort(sortingFunction);
  }
  return docs;
}

function mapStateToProps(state, ownProps) {
  const { manager } = state;
  const user = manager.email ? { name: manager.name, email: manager.email } : null;
  return {
    loading: manager.loading,
    creating: manager.creating,
    showingOwned: manager.showingOwned,
    showingShared: manager.showingShared,
    sorting: manager.sorting,
    user,
    documents: getDocuments(manager.documents, manager.showingOwned, manager.showingShared, manager.sorting),
    collapsed: !user,
    selectedDocumentID: ownProps.selectedDocumentID
  };
}

function mapDispatchToProps(dispatch) {
  return {
    initializeManager: () => {
      dispatch(initializeManager());
    },
    onNewDocumentClicked: () => {
      dispatch(createDocument());
    },
    onDeleteDocumentClicked: (id, title) => {
      dispatch(openDeleteModal(id, title));
    },
    onNavigateToSettingsClicked: () => {
      dispatch(navigateToSettings());
    },
    onSignOutClicked: () => {
      dispatch(signOut());
    },
    onChangeSortingOrder: order => {
      dispatch(changeSortingOrder(order));
    },
    onToggleShowOwnedDocuments: () => {
      dispatch(toggleShowOwnedDocuments());
    },
    onToggleShowSharedDocuments: () => {
      dispatch(toggleShowSharedDocuments());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentManager);
