import { SHOW_DELETE_DOCUMENT_MODAL, HIDE_DELETE_DOCUMENT_MODAL } from '../actions/documentDelete';

const initialState = {
  opened: false,
  documentID: '',
  title: '',
  deleting: false
};

function documentDeleteReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_DELETE_DOCUMENT_MODAL: {
      return Object.assign({}, initialState, {
        opened: true,
        documentID: action.documentID,
        title: action.title
      });
    }
    case HIDE_DELETE_DOCUMENT_MODAL:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default documentDeleteReducer;
