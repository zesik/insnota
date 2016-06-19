import React from 'react';
import { Router, Route, Redirect, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Notes from './Notes';
import configureStore from '../../configureNotesStore';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

export default function Root() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Redirect from="/notes/" to="/notes" />
        <Route path="/notes(/:id)" component={Notes} />
      </Router>
    </Provider>
  );
}
