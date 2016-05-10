import {
  LOAD_DOCUMENTS,
  START_CREATING_DOCUMENT,
  FINISH_CREATING_DOCUMENT,
  CHANGE_DOCUMENT_TITLE
} from '../actions/documentManager';

const initialState = {
  fetchingDocuments: false,
  creatingDocument: false,
  userName: '',
  userEmail: '',
  documents: []
};

function documentManagerReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DOCUMENTS:
      return Object.assign({}, state, {
        fetchingDocuments: action.fetchingDocuments,
        userName: action.userName,
        userEmail: action.userEmail,
        documents: action.documents
      });
    case START_CREATING_DOCUMENT:
      return Object.assign({}, state, {
        creatingDocument: true
      });
    case FINISH_CREATING_DOCUMENT:
      if (action.error) {
        return state;
      }
      return Object.assign({}, state, {
        documents: [
          {
            id: action.id,
            title: action.title
          },
          ...state.documents
        ]
      });
    case CHANGE_DOCUMENT_TITLE:
      return Object.assign({}, state, {
        documents: state.documents.map((doc) => {
          if (doc.id === action.documentID) {
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
