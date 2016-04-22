import 'whatwg-fetch';

export const LOAD_DOCUMENT_LIST = 'LOAD_DOCUMENT_LIST';
export const SELECT_DOCUMENT = 'SELECT_DOCUMENT';
export const CREATE_DOCUMENT = 'CREATE_DOCUMENT';
export const CHANGE_DOCUMENT_TITLE = 'CHANGE_DOCUMENT_TITLE';

export function loadDocumentList(loading, documentList) {
  return {
    type: LOAD_DOCUMENT_LIST,
    loading,
    documentList
  };
}

export function getDocumentList() {
  return dispatch => {
    dispatch(loadDocumentList(true, []));
    return fetch('/api/notes', { credentials: 'same-origin' })
      .then(response => response.json())
      .then(json => dispatch(loadDocumentList(false, json)));
  };
}

export function selectDocument(documentID) {
  return {
    type: SELECT_DOCUMENT,
    documentID
  };
}

export function createDocument(documentID) {
  return {
    type: CREATE_DOCUMENT,
    documentID
  };
}

export function changeDocumentTitle(title) {
  return {
    type: CHANGE_DOCUMENT_TITLE,
    title
  };
}
