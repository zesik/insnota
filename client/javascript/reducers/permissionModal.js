import {
  SHOW_PERMISSION_MODAL,
  HIDE_PERMISSION_MODAL,
  INITIALIZE_PERMISSION_MODAL,
  EDIT_COLLABORATOR_PERMISSION,
  EDIT_EDITOR_INVITING,
  EDIT_ANONYMOUS_EDITING,
  ADD_COLLABORATOR_PLACEHOLDER,
  EDIT_COLLABORATOR_PLACEHOLDER,
  START_ADDING_COLLABORATOR,
  FINISH_ADDING_COLLABORATOR,
  CANCEL_ADDING_COLLABORATOR,
  REMOVE_COLLABORATOR,
  START_SUBMITTING_PERMISSIONS,
  FINISH_SUBMITTING_PERMISSIONS
} from '../actions/permissionModal';

const initialEmailNoticeState = {
  errorEmailEmpty: false,
  errorEmailInvalid: false,
  errorEmailNotExist: false,
  errorEmailAlreadyExists: false,
  errorEmailIsOwner: false
};

const initialNoticeState = Object.assign({
  errorNotFound: false,
  serverError: false
}, initialEmailNoticeState);

const initialState = Object.assign({
  loading: false,
  opened: false,
  documentID: '',
  canEdit: '',
  ownerName: '',
  ownerEmail: '',
  collaborators: [],
  collaboratorPlaceholderVisible: false,
  collaboratorPlaceholderEmail: '',
  editorInviting: false,
  anonymousEditing: ''
}, initialNoticeState);

function permissionModalReducer(state = initialState, action) {
  switch (action.type) {
    case SHOW_PERMISSION_MODAL:
      return Object.assign({}, initialState, {
        loading: true,
        opened: true,
        documentID: action.documentID
      });
    case HIDE_PERMISSION_MODAL:
      return Object.assign({}, initialState);
    case INITIALIZE_PERMISSION_MODAL:
      return Object.assign({}, state, {
        loading: false,
        canEdit: action.canEdit,
        ownerName: action.ownerName,
        ownerEmail: action.ownerEmail,
        collaborators: action.collaborators,
        editorInviting: action.editorInviting,
        anonymousEditing: action.anonymousEditing
      }, action.errors);
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
        collaboratorPlaceholderVisible: true,
        collaboratorPlaceholderEmail: ''
      }, initialEmailNoticeState);
    case EDIT_COLLABORATOR_PLACEHOLDER:
      return Object.assign({}, state, {
        collaboratorPlaceholderEmail: action.email
      });
    case START_ADDING_COLLABORATOR:
      return Object.assign({}, state, {
        loading: true
      }, initialNoticeState);
    case FINISH_ADDING_COLLABORATOR:
      if (action.errors && Object.keys(action.errors).length > 0) {
        return Object.assign({}, state, {
          loading: false
        }, action.errors);
      }
      return Object.assign({}, state, {
        loading: false,
        collaboratorPlaceholderVisible: false,
        collaboratorPlaceholderEmail: '',
        collaborators: [
          ...state.collaborators,
          {
            email: action.email,
            name: action.name,
            permission: 'view'
          }
        ]
      });
    case CANCEL_ADDING_COLLABORATOR:
      return Object.assign({}, state, {
        collaboratorPlaceholderVisible: false,
        collaboratorPlaceholderEmail: ''
      });
    case REMOVE_COLLABORATOR:
      return Object.assign({}, state, {
        collaborators: state.collaborators.filter(item => item.email !== action.email)
      });
    case START_SUBMITTING_PERMISSIONS:
      return Object.assign({}, state, {
        loading: true
      }, initialNoticeState);
    case FINISH_SUBMITTING_PERMISSIONS:
      return Object.assign({}, state, {
        loading: false
      }, action.errors);
    default:
      return state;
  }
}

export default permissionModalReducer;
