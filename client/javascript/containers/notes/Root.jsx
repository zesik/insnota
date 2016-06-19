import React from 'react';
import { Router, Route, Redirect, IndexRedirect, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Notes from './Notes';
import Settings from './Settings';
import Profile from './Profile';
import Security from './Security';
import configureStore from '../../configureNotesStore';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

export default function Root() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Redirect from="/notes/" to="/notes" />
        <Route path="/notes(/:id)" component={Notes} />
        <Route path="/settings" component={Settings}>
          <IndexRedirect to="profile" />
          <Route path="profile" component={Profile} />
          <Route path="security" component={Security} />
        </Route>
      </Router>
    </Provider>
  );
}
