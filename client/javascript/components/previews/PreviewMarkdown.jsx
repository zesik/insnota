import React from 'react';
import ReactMarkdown from 'react-markdown';

function PreviewMarkdown(props) {
  return (
    <div className="preview-markdown">
      <ReactMarkdown source={props.content} escapeHtml />
    </div>
  );
}

PreviewMarkdown.propTypes = {
  content: React.PropTypes.string
};

export default PreviewMarkdown;
