import React from 'react';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';

function Collaborators({ collaborators }) {
  return (
    <div className="collaborator-list">
      {collaborators.map(item => (
        <div className="collaborator" key={item.clientID} title={item.email || 'Anonymous'}>
          <UserAvatar email={item.email} size={24} color={item.color} cornerRadius={0} />
          <div className={classNames({ 'collaborator-color': true, [`color-${item.color}`]: true })} />
        </div>
      ))}
    </div>
  );
}

Collaborators.propTypes = {
  collaborators: React.PropTypes.arrayOf(React.PropTypes.shape({
    clientID: React.PropTypes.string.isRequired,
    name: React.PropTypes.string,
    email: React.PropTypes.string,
    color: React.PropTypes.number
  }))
};

export default Collaborators;
