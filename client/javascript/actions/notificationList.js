import {
  NOTIFICATION_INFORMATION,
  NOTIFICATION_WARNING,
  NOTIFICATION_ERROR,
  NOTIFICATION_DISPLAY_TIME
} from '../constants/notificationLevels';

let nextNotificationID = 0;

export const APPEND_NOTIFICATION = 'APPEND_NOTIFICATION';
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

export function showInformation(message) {
  return showNotification(NOTIFICATION_INFORMATION, message);
}

export function showWarning(message) {
  return showNotification(NOTIFICATION_WARNING, message);
}

export function showError(message) {
  return showNotification(NOTIFICATION_ERROR, message);
}

function showNotification(level, message) {
  let id = nextNotificationID++;
  return dispatch => {
    dispatch(appendNotification(id, level, message));
    setTimeout(() => dispatch(removeNotification(id)), NOTIFICATION_DISPLAY_TIME);
  };
}

function appendNotification(id, level, message) {
  return {
    type: APPEND_NOTIFICATION,
    id,
    level,
    message
  };
}

function removeNotification(id) {
  return {
    type: REMOVE_NOTIFICATION,
    id
  };
}
