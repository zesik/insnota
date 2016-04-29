import { LOAD_DOCUMENTS, CREATE_DOCUMENT, CHANGE_DOCUMENT_TITLE } from '../actions/documentManager';

const initialState = {
  fetchingDocuments: false,
  documents: []
};

function documentManagerReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DOCUMENTS:
      return Object.assign({}, state, {
        fetchingDocuments: action.fetchingDocuments,
        documents: action.documents
      });
    case CREATE_DOCUMENT:
      return Object.assign({}, state, {
        documents: [
          {
            id: action.documentID,
            title: '',
            content: ''
          },
          ...state.documents
        ]
      });
    case CHANGE_DOCUMENT_TITLE:
      return Object.assign({}, state, {
        documents: state.documents.map((doc) => {
          if (doc.id === state.selectedDocumentID) {
            return Object.assign({}, doc, {
              title: action.title
            });
          }
          return doc;
        })
      });
    default:
      return state;
  }
}

export default documentManagerReducer;
