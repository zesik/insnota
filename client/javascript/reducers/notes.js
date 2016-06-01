import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import document from './documentManager';
import permissionModal from './permissionModal';
import deleteModal from './documentDelete';
import notification from './notificationCenter';

const rootReducer = combineReducers({
  document,
  permissionModal,
  deleteModal,
  notification,
  routing: routerReducer
});

export default rootReducer;
