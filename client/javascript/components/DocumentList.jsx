import React from 'react';
import Document from './Document';

class DocumentList extends React.Component {
  handleDocumentClick(documentID) {
    if (this.props.onDocumentClicked) {
      this.props.onDocumentClicked(documentID);
    }
  }

  render() {
    let loading;
    if (this.props.loading) {
      loading = (<div className="document-list-loading">Loading...</div>);
    } else {
      loading = (<div className="document-list-loading"></div>);
    }
    return (
      <div className="document-list-container">
        <button className="new-document" onClick={this.props.onNewDocumentClicked}>
          New Document
        </button>
        {loading}
        <div className="document-list">
          {this.props.documentList.map(function (item) {
            const boundClick = this.handleDocumentClick.bind(this, item.documentID);
            return (
              <Document
                key={item.documentID}
                title={item.title}
                lastModified={item.lastModified}
                selected={item.documentID === this.props.selectedDocumentID}
                onClick={boundClick}
              />
            );
          }, this)}
          <Document />
        </div>
      </div>
    );
  }
}

DocumentList.propTypes = {
  loading: React.PropTypes.bool,
  selectedDocumentID: React.PropTypes.string,
  documentList: React.PropTypes.arrayOf(React.PropTypes.shape({
    documentID: React.PropTypes.string.isRequired,
    title: React.PropTypes.string,
    lastModified: React.PropTypes.string
  })),
  onNewDocumentClicked: React.PropTypes.func,
  onDocumentClicked: React.PropTypes.func
};

export default DocumentList;
