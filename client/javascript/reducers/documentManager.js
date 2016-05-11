import {
  LOAD_DOCUMENTS,
  START_CREATING_DOCUMENT,
  FINISH_CREATING_DOCUMENT,
  CHANGE_DOCUMENT_TITLE,
  SHOW_DELETE_DOCUMENT_MODAL,
  HIDE_DELETE_DOCUMENT_MODAL
} from '../actions/documentManager';

const initialState = {
  fetchingDocuments: false,
  creatingDocument: false,
  userName: '',
  userEmail: '',
  documents: [],
  modalDeleteDocument: {
    visible: false
  }
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
    case SHOW_DELETE_DOCUMENT_MODAL: {
      const document = state.documents.find(item => item.id === action.documentID);
      if (!document) {
        return state;
      }
      return Object.assign({}, state, {
        modalDeleteDocument: {
          visible: true,
          documentID: action.documentID,
          title: document.title
        }
      });
    }
    case HIDE_DELETE_DOCUMENT_MODAL:
      return Object.assign({}, state, {
        modalDeleteDocument: {
          visible: false
        }
      });
    default:
      return state;
  }
}

export default documentManagerReducer;
