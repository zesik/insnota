export const SELECT_DOCUMENT = 'SELECT_DOCUMENT';
export const CREATE_DOCUMENT = 'CREATE_DOCUMENT';
export const CHANGE_DOCUMENT_TITLE = 'CHANGE_DOCUMENT_TITLE';

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
