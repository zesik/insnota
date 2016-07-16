import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { notificationReducer } from 're-alert';
import manager from './documentManager';
import permissionModal from './permissionModal';
import deleteModal from './deleteModal';

import settings from './settings';

const rootReducer = combineReducers({
  manager,
  permissionModal,
  deleteModal,
  settings,
  notification: notificationReducer,
  routing: routerReducer
});

export default rootReducer;
