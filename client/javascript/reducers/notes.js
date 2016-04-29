import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import documentManager from './documentManager';
import notificationCenter from './notificationCenter';

const rootReducer = combineReducers({
  document: documentManager,
  notification: notificationCenter,
  routing: routerReducer
});

export default rootReducer;
