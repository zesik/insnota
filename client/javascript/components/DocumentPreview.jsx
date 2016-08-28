import React from 'react';
import { getModeName } from '../utils/editorLanguageModes';
import PreviewMarkdown from './previews/PreviewMarkdown';

function DocumentPreview(props) {
  let preview = null;
  switch (getModeName(props.mode)) {
    case 'Markdown':
      preview = (<PreviewMarkdown content={props.content} />);
      break;
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
  return (<div className="document-preview">{preview}</div>);
}

DocumentPreview.propTypes = {
  mode: React.PropTypes.string,
  content: React.PropTypes.string
};

export default DocumentPreview;
