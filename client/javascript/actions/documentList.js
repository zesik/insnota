export const SELECT_DOCUMENT = 'SELECT_DOCUMENT';

export function selectDocument(documentID) {
  return {
    type: SELECT_DOCUMENT,
    data: documentID
  };
}
