import 'whatwg-fetch';
import { push } from 'react-router-redux';

export const SHOW_DELETE_MODAL = 'SHOW_DELETE_MODAL';
export const HIDE_DELETE_MODAL = 'HIDE_DELETE_MODAL';
export const START_DELETING_DOCUMENT = 'START_DELETING_DOCUMENT';
export const FINISH_DELETING_DOCUMENT = 'FINISH_DELETING_DOCUMENT';

export function openDeleteModal(documentID, title) {
  return {
    type: SHOW_DELETE_MODAL,
    documentID,
    title
  };
}

export function closeDeleteModal(deletedDocumentID) {
  return {
    type: HIDE_DELETE_MODAL,
    deletedDocumentID
  };
}

function startDeletingDocument() {
  return {
    type: START_DELETING_DOCUMENT
  };
}

function finishDeletingDocument(errors) {
  return {
    type: FINISH_DELETING_DOCUMENT,
    errors
  };
}

export function deleteDocument(documentID, isOpened) {
  return dispatch => {
    dispatch(startDeletingDocument());
    fetch(`/api/notes/${documentID}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function () {
      dispatch(finishDeletingDocument());
      dispatch(closeDeleteModal(documentID));
      if (isOpened) {
        dispatch(push('/notes'));
      }
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishDeletingDocument({ serverError: true }));
        return;
      }
      dispatch(finishDeletingDocument({ errorNotFound: true }));
    });
  };
}
