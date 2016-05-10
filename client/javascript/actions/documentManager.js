import 'whatwg-fetch';
import { push } from 'react-router-redux';

export const LOAD_DOCUMENTS = 'LOAD_DOCUMENTS';
export const START_CREATING_DOCUMENT = 'START_CREATING_DOCUMENT';
export const FINISH_CREATING_DOCUMENT = 'FINISH_CREATING_DOCUMENT';
export const CHANGE_DOCUMENT_TITLE = 'CHANGE_DOCUMENT_TITLE';

function loadDocuments(fetchingDocuments, userName, userEmail, documents) {
  return {
    type: LOAD_DOCUMENTS,
    fetchingDocuments,
    userName,
    userEmail,
    documents
  };
}

function startCreatingDocument() {
  return {
    type: START_CREATING_DOCUMENT
  };
}

function finishCreatingDocument(error, id, title) {
  return {
    type: FINISH_CREATING_DOCUMENT,
    error,
    id,
    title
  };
}

export function getDocuments() {
  return dispatch => {
    dispatch(loadDocuments(true, '', '', []));
    return fetch('/api/notes', { credentials: 'same-origin' })
      .then(response => response.json())
      .then(json => dispatch(loadDocuments(false, json.name, json.email, json.documents)));
  };
}

export function createDocument() {
  return dispatch => {
    dispatch(startCreatingDocument());
    fetch('/api/notes', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }).then(function (json) {
      dispatch(finishCreatingDocument(null, json.id, json.title));
      dispatch(push(`/notes/${json.id}`));
    }).catch(function (err) {
      dispatch(finishCreatingDocument(err));
    });
  };
}

export function changeDocumentTitle(documentID, title) {
  return {
    type: CHANGE_DOCUMENT_TITLE,
    documentID,
    title
  };
}

export function deleteDocument(documentID, isOpened) {
  return dispatch => {
    if (isOpened) {
      dispatch(push('/notes'));
    }
  };
}
