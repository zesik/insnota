import {
  SHOW_PERMISSION_MODAL,
  HIDE_PERMISSION_MODAL,
  EDIT_COLLABORATOR_PERMISSION,
  EDIT_EDITOR_INVITING,
  EDIT_ANONYMOUS_EDITING,
  ADD_COLLABORATOR,
  EDIT_NEW_COLLABORATOR,
  CANCEL_ADD_COLLABORATOR,
  REMOVE_COLLABORATOR,
  INITIALIZE_PERMISSION_MODAL
} from '../actions/documentPermission';

const initialState = {
  opened: false,
  documentID: '',
  loading: false,
  saving: false,
  adding: false,
  error: null,
  errorAdding: null,
  canEdit: '',
  ownerName: '',
  ownerEmail: '',
  collaborators: [],
  editorInviting: false,
  anonymousEditing: '',
  editingNewCollaborator: false,
  newCollaboratorEmail: ''
};

function documentPermissionReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_PERMISSION_MODAL:
      return Object.assign({}, initialState, {
        opened: true,
        documentID: action.documentID,
        loading: true
      });
    case HIDE_PERMISSION_MODAL:
      return Object.assign({}, initialState);
    case INITIALIZE_PERMISSION_MODAL:
      return Object.assign({}, state, {
        loading: false,
        error: action.error,
        canEdit: action.canEdit,
        ownerName: action.ownerName,
        ownerEmail: action.ownerEmail,
        collaborators: action.collaborators,
        editorInviting: action.editorInviting,
        anonymousEditing: action.anonymousEditing
      });
    case EDIT_COLLABORATOR_PERMISSION:
      return Object.assign({}, state, {
        collaborators: state.collaborators.map(item => {
          if (item.email !== action.email) {
            return item;
          }
          return {
            email: action.email,
            name: item.name,
            permission: action.permission
          };
        })
      });
    case EDIT_EDITOR_INVITING:
      return Object.assign({}, state, {
        editorInviting: action.editorInviting
      });
    case EDIT_ANONYMOUS_EDITING:
      return Object.assign({}, state, {
        anonymousEditing: action.anonymousEditing
      });
    case ADD_COLLABORATOR:
      return Object.assign({}, state, {
        editingNewCollaborator: true,
        newCollaboratorEmail: ''
      });
    case EDIT_NEW_COLLABORATOR:
      return Object.assign({}, state, {
        newCollaboratorEmail: action.email
      });
    case CANCEL_ADD_COLLABORATOR:
      return Object.assign({}, state, {
        editingNewCollaborator: false,
        newCollaboratorEmail: ''
      });
    case REMOVE_COLLABORATOR:
      return Object.assign({}, state, {
        collaborators: state.collaborators.filter(item => item.email !== action.email)
      });
    default:
      return state;
  }
}

export default documentPermissionReducer;
