import React from 'react';
import { Provider } from 'react-redux';
import App from './NotesApp';
import configureStore from '../configureNotesStore';

const store = configureStore();

export default class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}
