import { SELECT_DOCUMENT, CREATE_DOCUMENT, CHANGE_DOCUMENT_TITLE } from '../actions/documentList';

const initialState = {
  selectedDocumentID: '',
  documentList: []
};

function documentListReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_DOCUMENT:
      return Object.assign({}, state, {
        selectedDocumentID: action.documentID,
        documentList: [
          {
            documentID: action.documentID,
            title: '',
            content: ''
          },
          ...state.documentList
        ]
      });
    case SELECT_DOCUMENT:
      return Object.assign({}, state, {
        selectedDocumentID: action.documentID
      });
    case CHANGE_DOCUMENT_TITLE:
      return Object.assign({}, state, {
        documentList: state.documentList.map((doc) => {
          if (doc.documentID === state.selectedDocumentID) {
            return Object.assign({}, doc, {
              title: action.title
            });
          } else {
            return doc;
          }
        })
      });
    default:
      return state;
  }
}

export default documentListReducer;
