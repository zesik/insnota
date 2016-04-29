import React from 'react';
import { Link } from 'react-router';
import Document from './Document';

class DocumentManager extends React.Component {
  render() {
    return (
      <div className="document-list-container">
        <button className="new-document" onClick={this.props.onNewDocumentClicked}>
          New Document
        </button>
        {this.props.creating && <div className="document-creating">Creating...</div>}
        <div className="document-list">
          {this.props.fetching && <div className="loading">Loading...</div>}
          {(!this.props.fetching && this.props.documents.length === 0) && <div className="empty">No Documents</div>}
          {this.props.documents.map(function (item) {
            return (
              <Link key={item.id} to={`/notes/${item.id}`}>
                <Document
                  title={item.title}
                  lastModified={item.lastModified}
                  selected={item.id === this.props.selectedDocumentID}
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
  fetching: React.PropTypes.bool,
  creating: React.PropTypes.bool,
  documents: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    lastModified: React.PropTypes.string
  })),
  selectedDocumentID: React.PropTypes.string,
  onNewDocumentClicked: React.PropTypes.func.isRequired
};

export default DocumentManager;
