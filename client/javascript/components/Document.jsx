import React from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import moment from 'moment';

function Document(props) {
  const createTime = moment(props.createTime);
  const classes = classNames({
    'document-item': true,
    'document-item-selected': props.selected
  });
  return (
    <Link className={classes} key={props.id} to={`/notes/${props.id}`}>
      <div className="title">{props.title}</div>
      {props.access === 'owner' &&
        <div className="btn btn-link delete-button" onClick={e => props.onDeleteClicked(e)}>
          <i className="material-icons">delete</i>
        </div>
      }
      {props.access !== 'owner' &&
        <div className="access" title="This note is shared to you.">
          <i className="material-icons">group</i>
        </div>
      }
      <div className="create-time" title={createTime.format('lll')}>Created on {createTime.format('ll')}</div>
    </Link>
  );
}

Document.propTypes = {
  id: React.PropTypes.string.isRequired,
  selected: React.PropTypes.bool.isRequired,
  title: React.PropTypes.string.isRequired,
  createTime: React.PropTypes.string.isRequired,
  access: React.PropTypes.string.isRequired,
  onDeleteClicked: React.PropTypes.func.isRequired
};

export default Document;
