import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Layout from './Layout';
import SignIn from './SignIn';
import SignUp from './SignUp';
import NotFound from '../NotFound';
import configureStore from '../../configureAccountStore';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

export default function Root() {
  return (
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={Layout}>
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="*" component={NotFound} />
        </Route>
      </Router>
    </Provider>
  );
}
