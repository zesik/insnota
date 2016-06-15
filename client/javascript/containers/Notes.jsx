import React from 'react';
import { Router, Route, Redirect, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import App from './NotesApp';
import configureStore from '../configureNotesStore';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

export default function Root() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Redirect from="/notes/" to="/notes" />
        <Route path="/notes(/:id)" component={App} />
      </Router>
    </Provider>
  );
}
