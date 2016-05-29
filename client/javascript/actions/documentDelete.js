import 'whatwg-fetch';
import { push } from 'react-router-redux';

export const SHOW_DELETE_DOCUMENT_MODAL = 'SHOW_DELETE_DOCUMENT_MODAL';
export const HIDE_DELETE_DOCUMENT_MODAL = 'HIDE_DELETE_DOCUMENT_MODAL';

export function openDeleteDocumentModal(documentID, title) {
  return {
    type: SHOW_DELETE_DOCUMENT_MODAL,
    documentID,
    title
  };
}

export function closeDeleteDocumentModal() {
  return {
    type: HIDE_DELETE_DOCUMENT_MODAL
  };
}

export function deleteDocument(documentID, isOpened) {
  return dispatch => {
    if (isOpened) {
      dispatch(push('/notes'));
    }
    dispatch(closeDeleteDocumentModal());
  };
}
