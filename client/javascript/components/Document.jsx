import React from 'react';

function Document(props) {
  return (
    <div className="document">
      <div className="btn btn-link delete-button" onClick={e => props.onDeleteClicked(e)}>
        <i className="fa fa-trash-o" />
      </div>
      <div className="title">{props.title}</div>
      <div className="last-modified">{props.lastModified}</div>
      <div className="permission"></div>
    </div>
  );
}

Document.propTypes = {
  title: React.PropTypes.string.isRequired,
  lastModified: React.PropTypes.string,
  onDeleteClicked: React.PropTypes.func.isRequired
};

export default Document;
