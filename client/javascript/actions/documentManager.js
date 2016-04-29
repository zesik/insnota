import 'whatwg-fetch';

export const LOAD_DOCUMENTS = 'LOAD_DOCUMENTS';
export const CREATE_DOCUMENT = 'CREATE_DOCUMENT';
export const CHANGE_DOCUMENT_TITLE = 'CHANGE_DOCUMENT_TITLE';

function loadDocuments(fetchingDocuments, documents) {
  return {
    type: LOAD_DOCUMENTS,
    fetchingDocuments,
    documents
  };
}

export function getDocuments() {
  return dispatch => {
    dispatch(loadDocuments(true, []));
    return fetch('/api/notes', { credentials: 'same-origin' })
      .then(response => response.json())
      .then(json => dispatch(loadDocuments(false, json)));
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
