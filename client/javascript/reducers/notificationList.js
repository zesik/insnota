import { APPEND_NOTIFICATION, REMOVE_NOTIFICATION } from '../actions/notificationList';

const initialState = {
  notificationList: []
};

function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case APPEND_NOTIFICATION:
      return Object.assign({}, state, {
        notificationList: [
          { id: action.id, level: action.level, message: action.message },
          ...state.notificationList
        ]
      });
    case REMOVE_NOTIFICATION:
      return Object.assign({}, state, {
        notificationList: state.notificationList.filter(item => item.id !== action.id)
      });
    default:
      return state;
  }
}

export default notificationReducer;
