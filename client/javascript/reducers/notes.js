import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import manager from './documentManager';
import permissionModal from './permissionModal';
import deleteModal from './deleteModal';
import notification from './notificationCenter';
import settings from './settings';

const rootReducer = combineReducers({
  manager,
  permissionModal,
  deleteModal,
  notification,
  settings,
  routing: routerReducer
});

export default rootReducer;
