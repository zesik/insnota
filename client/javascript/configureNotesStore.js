import { createStore, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import rootReducer from './reducers/notes';

const loggerMiddleware = createLogger();

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      routerMiddleware(browserHistory),
      thunkMiddleware,
      loggerMiddleware
    )
  );
}
