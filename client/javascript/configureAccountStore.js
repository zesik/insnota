import { createStore, combineReducers, applyMiddleware } from 'redux';
import { routerReducer } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers/account';

const loggerMiddleware = createLogger();

export default function configureStore(initialState) {
  return createStore(
    combineReducers({
      account: rootReducer,
      routing: routerReducer
    }),
    initialState,
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware
    )
  );
}
