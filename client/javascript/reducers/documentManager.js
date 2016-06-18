import {
  START_LOADING_DOCUMENTS,
  FINISH_LOADING_DOCUMENTS,
  START_CREATING_DOCUMENT,
  FINISH_CREATING_DOCUMENT,
  CHANGE_DOCUMENT_TITLE
} from '../actions/documentManager';
import { HIDE_DELETE_MODAL } from '../actions/deleteModal';

const initialState = {
  // User information
  name: null,
  email: null,
  // Document list
  documents: [],
  loading: false,
  creating: false
};

function documentManagerReducer(state = initialState, action) {
  switch (action.type) {
    case START_LOADING_DOCUMENTS:
      return Object.assign({}, state, {
        loading: true
      });
    case FINISH_LOADING_DOCUMENTS:
      return Object.assign({}, state, {
        loading: false,
        name: action.name,
        email: action.email,
        documents: action.documents
      });
    case START_CREATING_DOCUMENT:
      return Object.assign({}, state, {
        creating: true
      });
    case FINISH_CREATING_DOCUMENT:
      if (action.error) {
        return Object.assign({}, state, {
          creating: false
        });
      }
      return Object.assign({}, state, {
        creating: false,
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
    case HIDE_DELETE_MODAL:
      if (!action.deletedDocumentID) {
        return state;
      }
      return Object.assign({}, state, {
        documents: state.documents.filter(doc => doc.id !== action.deletedDocumentID)
      });
    default:
      return state;
  }
}

export default documentManagerReducer;
