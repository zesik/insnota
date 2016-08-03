import React from 'react';
import classNames from 'classnames';
import { getModeName } from '../utils/editorLanguageModes';

function DocumentPreview(props) {
  let preview = null;
  switch (getModeName(props.mode)) {
    default:
      preview = (
        <div className="preview-not-available">
          <p>
            There is no preview available for current document mode.
          </p>
        </div>
      );
      break;
  }
  return (
    <div className={classNames({ 'document-preview': true, collapsed: !props.visible })}>
      {preview}
    </div>
  );
}

DocumentPreview.propTypes = {
  mode: React.PropTypes.string,
  content: React.PropTypes.string,
  visible: React.PropTypes.bool.isRequired
};

export default DocumentPreview;
