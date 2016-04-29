import React from 'react';
import { Router, Route, IndexRoute, Redirect, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Index from './NotesIndex';
import App from './NotesApp';
import configureStore from '../configureNotesStore';

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Redirect from="/notes/" to="/notes" />
          <Route path="/notes" component={Index}>
            <IndexRoute component={App} />
            <Route path="*" component={App} />
          </Route>
        </Router>
      </Provider>
    );
  }
}
