import 'whatwg-fetch';
import { push } from 'react-router-redux';

export const START_LOADING_DOCUMENTS = 'START_LOADING_DOCUMENTS';
export const FINISH_LOADING_DOCUMENTS = 'FINISH_LOADING_DOCUMENTS';
export const START_CREATING_DOCUMENT = 'START_CREATING_DOCUMENT';
export const FINISH_CREATING_DOCUMENT = 'FINISH_CREATING_DOCUMENT';
export const CHANGE_DOCUMENT_TITLE = 'CHANGE_DOCUMENT_TITLE';

function startLoadingDocuments() {
  return {
    type: START_LOADING_DOCUMENTS
  };
}

function finishLoadingDocuments(error, name, email, documents) {
  return {
    type: FINISH_LOADING_DOCUMENTS,
    error,
    name,
    email,
    documents: documents || []
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

export function initializeManager() {
  return dispatch => {
    dispatch(startLoadingDocuments());
    return fetch('/api/notes', {
      credentials: 'same-origin'
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function (json) {
      dispatch(finishLoadingDocuments(null, json.name, json.email, json.documents));
    })
    .catch(function (err) {
      dispatch(finishLoadingDocuments(err));
    });
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
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function (json) {
      dispatch(finishCreatingDocument(null, json.id, json.title));
      dispatch(push(`/notes/${json.id}`));
    })
    .catch(function (err) {
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

export function navigateToSettings() {
  return dispatch => {
    dispatch(push('/settings/profile'));
  }
}

export function signOut() {
  return dispatch => {
    dispatch(startCreatingDocument());
    fetch('/api/signout', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    })
    .then(() => window.location = '/');
  };
}
