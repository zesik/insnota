import 'whatwg-fetch';

export const SHOW_PERMISSION_MODAL = 'SHOW_PERMISSION_MODAL';
export const HIDE_PERMISSION_MODAL = 'HIDE_PERMISSION_MODAL';
export const INITIALIZE_PERMISSION_MODAL = 'INITIALIZE_PERMISSION_MODAL';
export const EDIT_COLLABORATOR_PERMISSION = 'EDIT_COLLABORATOR_PERMISSION';
export const EDIT_EDITOR_INVITING = 'EDIT_EDITOR_INVITING';
export const EDIT_ANONYMOUS_EDITING = 'EDIT_ANONYMOUS_EDITING';
export const ADD_COLLABORATOR_PLACEHOLDER = 'ADD_COLLABORATOR_PLACEHOLDER';
export const EDIT_COLLABORATOR_PLACEHOLDER = 'EDIT_COLLABORATOR_PLACEHOLDER';
export const START_ADDING_COLLABORATOR = 'START_ADDING_COLLABORATOR';
export const FINISH_ADDING_COLLABORATOR = 'FINISH_ADDING_COLLABORATOR';
export const CANCEL_ADDING_COLLABORATOR = 'CANCEL_ADDING_COLLABORATOR';
export const REMOVE_COLLABORATOR = 'REMOVE_COLLABORATOR';
export const START_SUBMITTING_PERMISSIONS = 'START_SUBMITTING_PERMISSIONS';
export const FINISH_SUBMITTING_PERMISSIONS = 'FINISH_SUBBMITING_PERMISSIONS';

function showPermissionModal(documentID) {
  return {
    type: SHOW_PERMISSION_MODAL,
    documentID
  };
}

function initializeModal(errors, ownerName, ownerEmail, collaborators, editorInviting, anonymousEditing, canEdit) {
  return {
    type: INITIALIZE_PERMISSION_MODAL,
    errors,
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
      const userEmail = getState().manager.email;
      let permission = 'none';
      if (userEmail) {
        if (json.owner.email === userEmail) {
          permission = 'owner';
        } else if (json.editorInviting) {
          for (let i = 0; i < json.collaborators.length; ++i) {
            if (json.collaborators[i].email === userEmail) {
              if (json.collaborators[i].permission === 'edit') {
                permission = 'collaborator';
              }
              break;
            }
          }
        }
      }
      dispatch(initializeModal(null, json.owner.name, json.owner.email, json.collaborators, json.editorInviting,
        json.anonymousEditing, permission));
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(initializeModal({ serverError: true }));
        return;
      }
      dispatch(initializeModal({ errorNotFound: true }));
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

function startAddingCollaborator() {
  return {
    type: START_ADDING_COLLABORATOR
  };
}

function finishAddingCollaborator(errors, email, name) {
  return {
    type: FINISH_ADDING_COLLABORATOR,
    errors,
    email,
    name
  };
}

export function addCollaborator(email) {
  return (dispatch, getState) => {
    dispatch(startAddingCollaborator());
    const errors = {};
    if (email.trim().length === 0) {
      errors.ERROR_EMAIL_EMPTY = true;
    } else if (!/[^@]+@[^@]+/.test(email.trim())) {
      errors.errorEmailInvalid = true;
    }
    const state = getState().permissionModal;
    if (state.ownerEmail === email) {
      errors.errorEmailIsOwner = true;
    } else if (state.collaborators.find(item => item.email === email)) {
      errors.errorEmailAlreadyExists = true;
    }
    if (Object.keys(errors).length > 0) {
      dispatch(finishAddingCollaborator(errors));
      return;
    }
    fetch(`/api/users/${email}`, {
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
      dispatch(finishAddingCollaborator(null, email, json.name));
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishAddingCollaborator({ serverError: true }));
        return;
      }
      dispatch(finishAddingCollaborator({ errorEmailNotExist: true }));
    });
  };
}

export function cancelAddingCollaborator() {
  return {
    type: CANCEL_ADDING_COLLABORATOR
  };
}

export function removeCollaborator(email) {
  return {
    type: REMOVE_COLLABORATOR,
    email
  };
}

function startSubmittingPermissions() {
  return {
    type: START_SUBMITTING_PERMISSIONS
  };
}

function finishSubmittingPermissions(errors) {
  return {
    type: FINISH_SUBMITTING_PERMISSIONS,
    errors
  };
}

export function submitPermission() {
  return (dispatch, getState) => {
    dispatch(startSubmittingPermissions());
    const modalData = getState().permissionModal;
    const data = {
      collaborators: modalData.collaborators.map(item => ({ email: item.email, permission: item.permission }))
    };
    if (modalData.canEdit === 'owner') {
      data.editorInviting = modalData.editorInviting;
      data.anonymousEditing = modalData.anonymousEditing;
    }
    fetch(`/api/notes/${modalData.documentID}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'same-origin'
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response;
      }
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    })
    .then(function () {
      dispatch(closePermissionModal());
    })
    .catch(function (err) {
      if (err.response.status >= 500) {
        console.error(err);
        dispatch(finishSubmittingPermissions({ serverError: true }));
        return;
      }
      dispatch(finishSubmittingPermissions({ errorNotFound: true }));
    });
  };
}
