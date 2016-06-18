import { SHOW_DELETE_MODAL, HIDE_DELETE_MODAL } from '../actions/deleteModal';

const initialState = {
  opened: false,
  documentID: '',
  title: '',
  deleting: false,
  error: null
};

function deleteModalReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_DELETE_MODAL: {
      return Object.assign({}, initialState, {
        opened: true,
        documentID: action.documentID,
        title: action.title
      });
    }
    case HIDE_DELETE_MODAL:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export default deleteModalReducer;
