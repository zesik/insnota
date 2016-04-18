import React from 'react';
import { connect } from 'react-redux';
import { getDocumentList, selectDocument, createDocument, changeDocumentTitle } from '../actions/documentList';
import DocumentList from '../components/DocumentList';
import SyncedEditor from '../components/SyncedEditor';

function createWebSocketURL(s = '') {
  const l = window.location;
  return ((l.protocol === 'https:') ? 'wss://' : 'ws://') + l.host + l.pathname + s;
}

class App extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getDocumentList());
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
        />
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
  dispatch: React.PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return state.documentList;
}

export default connect(mapStateToProps)(App);
