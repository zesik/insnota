import 'whatwg-fetch';
import { push } from 'react-router-redux';

export const SHOW_DELETE_MODAL = 'SHOW_DELETE_MODAL';
export const HIDE_DELETE_MODAL = 'HIDE_DELETE_MODAL';

export function openDeleteModal(documentID, title) {
  return {
    type: SHOW_DELETE_MODAL,
    documentID,
    title
  };
}

export function closeDeleteModal() {
  return {
    type: HIDE_DELETE_MODAL
  };
}

export function startDeleteDocument(documentID, isOpened) {
  return dispatch => {
    if (isOpened) {
      dispatch(push('/notes'));
    }
    dispatch(closeDeleteModal());
  };
}
