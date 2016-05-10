import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import Document from './Document';
import UserAvatar from './UserAvatar';

function getNoteCounter(count) {
  if (count === 0) {
    return 'No notes';
  } else if (count === 1) {
    return '1 note';
  }
  return `${count} notes`;
}

class DocumentManager extends React.Component {
  constructor(props) {
    super(props);
    this.handleNewDocumentClicked = this.handleNewDocumentClicked.bind(this);
    this.handleDeleteDocumentClicked = this.handleDeleteDocumentClicked.bind(this);
  }

  handleNewDocumentClicked() {
    const { fetching, creating, onNewDocumentClicked } = this.props;
    if (fetching || creating) {
      return;
    }
    onNewDocumentClicked();
  }

  handleDeleteDocumentClicked(e, documentID) {
    const { selectedDocumentID, onDeleteDocumentClicked } = this.props;
    e.preventDefault();
    onDeleteDocumentClicked(documentID, selectedDocumentID === documentID);
  }

  render() {
    const newDocClasses = classNames({
      'status-bar-item': true,
      'icon-button': true,
      disabled: this.props.fetching || this.props.creating
    });
    const containerClasses = classNames({
      'document-list-container': true,
      collapsed: this.props.collapsed
    });
    return (
      <div className={containerClasses}>
        <div className="document-list-header">
          {this.props.currentUser &&
          <div>
            <UserAvatar email={this.props.currentUser.email} size={32} cornerRadius={32} />
            <div className="user-info">
              <div className="user-name">{this.props.currentUser.name}</div>
              <div className="user-email">{this.props.currentUser.email}</div>
            </div>
          </div>
          }
        </div>
        <div className="document-list-status status-bar">
          <div className="status-bar-item note-counter">
            {this.props.fetching && <div className="loading">Loading...</div>}
            {(!this.props.fetching) && <div>{getNoteCounter(this.props.documents.length)}</div>}
          </div>
          <div className="status-bar-item flex-width" />
          <div className={newDocClasses} onClick={this.handleNewDocumentClicked}><i className="fa fa-plus" /></div>
        </div>
        <div className="document-list">
          {this.props.documents.map(function (item) {
            const classes = classNames({
              'document-item': true,
              'document-item-selected': item.id === this.props.selectedDocumentID
            });
            return (
              <Link className={classes} key={item.id} to={`/notes/${item.id}`}>
                <Document
                  title={item.title}
                  lastModified={item.lastModified}
                  onDeleteClicked={e => this.handleDeleteDocumentClicked(e, item.id)}
                />
              </Link>
            );
          }, this)}
        </div>
      </div>
    );
  }
}

DocumentManager.propTypes = {
  collapsed: React.PropTypes.bool,
  currentUser: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    email: React.PropTypes.string.isRequired
  }),
  fetching: React.PropTypes.bool,
  creating: React.PropTypes.bool,
  documents: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    lastModified: React.PropTypes.string
  })),
  selectedDocumentID: React.PropTypes.string,
  onNewDocumentClicked: React.PropTypes.func.isRequired,
  onDeleteDocumentClicked: React.PropTypes.func.isRequired
};

export default DocumentManager;
