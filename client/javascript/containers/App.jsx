import React from 'react';
import { connect } from 'react-redux';
import { selectDocument } from '../actions/documentList';
import SyncedEditor from '../components/SyncedEditor';

class App extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(selectDocument('untitled'));
  }

  render() {
    return (
      <div>
        <SyncedEditor
          socketURL="ws://localhost:3000/"
          collection="collection"
          documentID={this.props.selectedDocumentID}
          defaultTitle="Untitled"
          defaultContent=""
        />
      </div>
    );
  }
}

App.propTypes = {
  selectedDocumentID: React.PropTypes.string,
  dispatch: React.PropTypes.func.isRequired
};

function select(state) {
  return state.documentList;
}

export default connect(select)(App);
