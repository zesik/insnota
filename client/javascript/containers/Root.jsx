import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Index from './Index';
import Home from './Home';
import SignIn from './SignIn';
import SignUp from './SignUp';
import NotFound from './NotFound';
import configureStore from '../configureHomeStore';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={Index}>
            <IndexRoute component={Home} />
            <Route path="/signin" component={SignIn} />
            <Route path="/signup" component={SignUp} />
            <Route path="*" component={NotFound} />
          </Route>
        </Router>
      </Provider>
    );
  }
}
