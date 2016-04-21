import { combineReducers } from 'redux';
import documentList from './documentList';
import notificationList from './notificationList';

const rootReducer = combineReducers({
  documentList,
  notificationList
});

export default rootReducer;
