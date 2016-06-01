import {
  SHOW_PERMISSION_MODAL,
  HIDE_PERMISSION_MODAL,
  EDIT_COLLABORATOR_PERMISSION,
  EDIT_EDITOR_INVITING,
  EDIT_ANONYMOUS_EDITING,
  ADD_COLLABORATOR_PLACEHOLDER,
  EDIT_COLLABORATOR_PLACEHOLDER,
  UPDATE_COLLABORATOR_PLACEHOLDER_STATUS,
  FINISH_ADD_COLLABORATOR,
  CANCEL_ADD_COLLABORATOR,
  REMOVE_COLLABORATOR,
  INITIALIZE_PERMISSION_MODAL
} from '../actions/permissionModal';

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
  editingNewCollaborator: '',
  newCollaboratorEmail: ''
};

function permissionModalReducer(state = initialState, action) {
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
    case ADD_COLLABORATOR_PLACEHOLDER:
      return Object.assign({}, state, {
        editingNewCollaborator: 'editing',
        newCollaboratorEmail: ''
      });
    case EDIT_COLLABORATOR_PLACEHOLDER:
      return Object.assign({}, state, {
        newCollaboratorEmail: action.email
      });
    case UPDATE_COLLABORATOR_PLACEHOLDER_STATUS:
      return Object.assign({}, state, {
        editingNewCollaborator: action.adding ? 'adding' : 'editing',
        errorAdding: action.error || ''
      });
    case FINISH_ADD_COLLABORATOR:
      return Object.assign({}, state, {
        editingNewCollaborator: '',
        newCollaboratorEmail: '',
        collaborators: [
          ...state.collaborators,
          {
            email: action.email,
            name: action.name,
            permission: 'view'
          }
        ]
      });
    case CANCEL_ADD_COLLABORATOR:
      return Object.assign({}, state, {
        editingNewCollaborator: '',
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

export default permissionModalReducer;
