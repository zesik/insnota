import React from 'react';
import { DOC_INITIAL, DOC_OPENING, DOC_ERROR, DOC_DENIED } from './SyncedEditor';

function EditorOverlay(props) {
  let overlay;
  switch (props.state) {
    case DOC_INITIAL:
      overlay = (
        <div className="overlay">
          <h1 className="content app-name">Insnota</h1>
        </div>
      );
      break;
    case DOC_OPENING:
      overlay = (
        <div className="overlay">
          <div className="content">
            Opening...
          </div>
        </div>
      );
      break;
    case DOC_ERROR:
      overlay = (
        <div className="overlay">
          <div className="content">
            <h2>Server Error</h2>
            <p>
              We cannot show the page because the server may be experiencing some trouble.
              Please refresh the page in a few minutes.
            </p>
          </div>
        </div>
      );
      break;
    case DOC_DENIED:
      overlay = (
        <div className="overlay">
          <div className="content">
            <h2>Access Denied</h2>
            <p>You do not have permission to access this note.</p>
          </div>
        </div>
      );
      break;
    default:
      overlay = (<div className="overlay hide" />);
      break;
  }
  return overlay;
}

EditorOverlay.propTypes = {
  state: React.PropTypes.string.isRequired
};

export default EditorOverlay;
