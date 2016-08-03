import {
  START_LOADING_DOCUMENTS,
  FINISH_LOADING_DOCUMENTS,
  START_CREATING_DOCUMENT,
  FINISH_CREATING_DOCUMENT,
  CHANGE_DOCUMENT_TITLE,
  CHANGE_SORTING_ORDER,
  TOGGLE_SHOW_OWNED_DOCUMENTS,
  TOGGLE_SHOW_SHARED_DOCUMENTS,
  TOGGLE_FULL_SCREEN,
  TOGGLE_PREVIEW
} from '../actions/documentManager';
import { HIDE_DELETE_MODAL } from '../actions/deleteModal';
import { SORTING_CREATE_TIME_DESCENDING } from '../constants/documentManager';

const initialState = {
  // User information
  name: null,
  email: null,
  // Document list
  documents: [],
  loading: false,
  creating: false,
  showingOwned: true,
  showingShared: true,
  sorting: SORTING_CREATE_TIME_DESCENDING,
  // Editor options
  fullScreen: false,
  previewVisible: false
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
            title: action.title,
            createTime: action.createTime,
            access: 'owner'
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
    case CHANGE_SORTING_ORDER:
      return Object.assign({}, state, {
        sorting: action.order
      });
    case TOGGLE_SHOW_OWNED_DOCUMENTS:
      return Object.assign({}, state, {
        showingOwned: !state.showingOwned
      });
    case TOGGLE_SHOW_SHARED_DOCUMENTS:
      return Object.assign({}, state, {
        showingShared: !state.showingShared
      });
    case TOGGLE_FULL_SCREEN:
      return Object.assign({}, state, {
        fullScreen: !state.fullScreen
      });
    case TOGGLE_PREVIEW:
      return Object.assign({}, state, {
        previewVisible: !state.previewVisible
      });
    default:
      return state;
  }
}

export default documentManagerReducer;
