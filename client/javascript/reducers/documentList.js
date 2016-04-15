import { SELECT_DOCUMENT } from '../actions/documentList';

const initialState = {
  selectedDocumentID: '',
  documents: []
};

function documentListReducer(state = initialState, action) {
  switch (action.type) {
    case SELECT_DOCUMENT:
      return Object.assign({}, state, {
        selectedDocumentID: action.data
      });
    default:
      return state;
  }
}

export default documentListReducer;
