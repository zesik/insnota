import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';
import Document from '../../components/Document';
import UserAvatar from '../../components/UserAvatar';
import { initializeManager, createDocument } from '../../actions/documentManager';
import { openDeleteModal } from '../../actions/deleteModal';

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
            <div>
              <UserAvatar email={this.props.user.email} size={32} cornerRadius={32} />
              <div className="user-info">
                <div className="user-name">{this.props.user.name}</div>
                <div className="user-email">{this.props.user.email}</div>
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
          <button className={newDocClasses} onClick={this.handleNewDocumentClicked}>
            <i className="fa fa-plus" />
          </button>
        </div>
        <div className="document-list">
          {this.props.documents.map(item => {
            const classes = classNames({
              'document-item': true,
              'document-item-selected': item.id === this.props.selectedDocumentID
            });
            return (
              <Link className={classes} key={item.id} to={`/notes/${item.id}`}>
                <Document
                  title={item.title}
                  lastModified={item.lastModified}
                  onDeleteClicked={e => this.handleDeleteDocumentClicked(e, item.id, item.title)}
                />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
}

DocumentManager.propTypes = {
  loading: React.PropTypes.bool.isRequired,
  creating: React.PropTypes.bool.isRequired,
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired
  }),
  documents: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    lastModified: React.PropTypes.string
  })).isRequired,
  selectedDocumentID: React.PropTypes.string,
  collapsed: React.PropTypes.bool.isRequired,
  initializeManager: React.PropTypes.func.isRequired,
  onNewDocumentClicked: React.PropTypes.func.isRequired,
  onDeleteDocumentClicked: React.PropTypes.func.isRequired
};

function mapStateToProps(state, ownProps) {
  const user = state.manager.email ? { name: state.manager.name, email: state.manager.email } : null;
  return {
    loading: state.manager.loading,
    creating: state.manager.creating,
    user,
    documents: state.manager.documents,
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
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentManager);
