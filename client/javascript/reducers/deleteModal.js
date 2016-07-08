import {
  SHOW_DELETE_MODAL,
  HIDE_DELETE_MODAL,
  START_DELETING_DOCUMENT,
  FINISH_DELETING_DOCUMENT
} from '../actions/deleteModal';

const initialNoticeState = {
  serverError: false
};

const initialState = Object.assign({
  loading: false,
  opened: false,
  documentID: '',
  title: ''
}, initialNoticeState);

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
    case START_DELETING_DOCUMENT:
      return Object.assign({}, state, {
        loading: true
      }, initialNoticeState);
    case FINISH_DELETING_DOCUMENT:
      return Object.assign({}, state, {
        loading: false
      }, action.errors);
    default:
      return state;
  }
}

export default deleteModalReducer;
