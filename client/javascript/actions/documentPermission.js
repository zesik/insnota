import 'whatwg-fetch';

export const SHOW_PERMISSION_MODAL = 'SHOW_PERMISSION_MODAL';
export const HIDE_PERMISSION_MODAL = 'HIDE_PERMISSION_MODAL';
export const INITIALIZE_PERMISSION_MODAL = 'INITIALIZE_PERMISSION_MODAL';
export const EDIT_COLLABORATOR_PERMISSION = 'EDIT_COLLABORATOR_PERMISSION';
export const EDIT_EDITOR_INVITING = 'EDIT_EDITOR_INVITING';
export const EDIT_ANONYMOUS_EDITING = 'EDIT_ANONYMOUS_EDITING';
export const ADD_COLLABORATOR_PLACEHOLDER = 'ADD_COLLABORATOR_PLACEHOLDER';
export const EDIT_COLLABORATOR_PLACEHOLDER = 'EDIT_COLLABORATOR_PLACEHOLDER';
export const UPDATE_COLLABORATOR_PLACEHOLDER_STATUS = 'UPDATE_COLLABORATOR_PLACEHOLDER_STATUS';
export const FINISH_ADD_COLLABORATOR = 'FINISH_ADD_COLLABORATOR';
export const CANCEL_ADD_COLLABORATOR = 'CANCEL_ADD_COLLABORATOR';
export const REMOVE_COLLABORATOR = 'REMOVE_COLLABORATOR';

function showPermissionModal(documentID) {
  return {
    type: SHOW_PERMISSION_MODAL,
    documentID
  };
}

function initializePermissionModal(error, ownerName, ownerEmail, collaborators, editorInviting, anonymousEditing,
                                   canEdit) {
  return {
    type: INITIALIZE_PERMISSION_MODAL,
    error,
    canEdit,
    ownerName,
    ownerEmail,
    collaborators,
    editorInviting,
    anonymousEditing
  };
}

export function openPermissionModal(documentID) {
  return (dispatch, getState) => {
    dispatch(showPermissionModal(documentID));
    fetch(`/api/notes/${documentID}`, {
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }).then(function (json) {
      const userEmail = getState().document.userEmail;
      let permission = 'none';
      if (userEmail) {
        if (json.owner.email === userEmail) {
          permission = 'owner';
        } else if (json.editorInviting) {
          for (let i = 0; i < json.collaborators.length; ++i) {
            if (json.collaborators[i].email === userEmail && json.collaborators[i].permission === 'edit') {
              permission = 'edit';
              break;
            }
          }
        }
      }
      dispatch(initializePermissionModal(null, json.owner.name, json.owner.email, json.collaborators,
        json.editorInviting, json.anonymousEditing, permission));
    }).catch(function (err) {
      dispatch(initializePermissionModal(err));
    });
  };
}

export function closePermissionModal() {
  return {
    type: HIDE_PERMISSION_MODAL
  };
}

export function editCollaboratorPermission(email, permission) {
  return {
    type: EDIT_COLLABORATOR_PERMISSION,
    email,
    permission
  };
}

export function editEditorInviting(editorInviting) {
  return {
    type: EDIT_EDITOR_INVITING,
    editorInviting
  };
}

export function editAnonymousEditing(anonymousEditing) {
  return {
    type: EDIT_ANONYMOUS_EDITING,
    anonymousEditing
  };
}

export function addCollaboratorPlaceholder() {
  return {
    type: ADD_COLLABORATOR_PLACEHOLDER
  };
}

export function editCollaboratorPlaceholder(email) {
  return {
    type: EDIT_COLLABORATOR_PLACEHOLDER,
    email
  };
}

function updateCollaboratorPlaceholderStatus(adding, error) {
  return {
    type: UPDATE_COLLABORATOR_PLACEHOLDER_STATUS,
    adding,
    error
  };
}

function finishAddCollaborator(email, name) {
  return {
    type: FINISH_ADD_COLLABORATOR,
    email,
    name
  };
}

export function startAddCollaborator(email) {
  return dispatch => {
    dispatch(updateCollaboratorPlaceholderStatus(true));
    // TODO: validate email address
    dispatch(finishAddCollaborator(email, ''));
  };
}

export function cancelAddCollaborator() {
  return {
    type: CANCEL_ADD_COLLABORATOR
  };
}

export function removeCollaborator(email) {
  return {
    type: REMOVE_COLLABORATOR,
    email
  };
}
