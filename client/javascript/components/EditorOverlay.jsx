import React from 'react';
import { DOC_INITIAL, DOC_OPENING, DOC_FAILED } from './SyncedEditor';

function EditorOverlay(props) {
  let overlay;
  switch (props.state) {
    case DOC_INITIAL:
      overlay = (<div className="overlay" />);
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
    case DOC_FAILED:
      overlay = (
        <div className="overlay">
          <div className="content">
            Failed
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

export default EditorOverlay;
