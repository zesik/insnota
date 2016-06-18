import 'whatwg-fetch';
import { push } from 'react-router-redux';

export const SHOW_DELETE_MODAL = 'SHOW_DELETE_MODAL';
export const HIDE_DELETE_MODAL = 'HIDE_DELETE_MODAL';
export const UPDATE_DELETE_STATUS = 'UPDATE_DELETE_STATUS';

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

function updateDeleteStatus(deleting, error) {
  return {
    type: UPDATE_DELETE_STATUS,
    deleting,
    error
  };
}

export function startDeleteDocument(documentID, isOpened) {
  return dispatch => {
    dispatch(updateDeleteStatus(true));
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
      dispatch(updateDeleteStatus(false));
      dispatch(closeDeleteModal(documentID));
      if (isOpened) {
        dispatch(push('/notes'));
      }
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(updateDeleteStatus(false, 'Server error'));
        return;
      }
      err.response.json().then(function (json) {
        dispatch(updateDeleteStatus(false, json));
      });
    });
  };
}
