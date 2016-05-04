import React from 'react';
import UserAvatar from './UserAvatar';

function Collaborators({ collaborators }) {
  return (
    <div className="collaborator-list">
      {collaborators.map(item => {
        const colors = item.color.split(':');
        const colorStyle = { backgroundColor: `#${colors[0]}` };
        return (
          <div className="collaborator" key={item.clientID} title={item.email || 'Anonymous'}>
            <UserAvatar email={item.email} size={24} color={colors[0]} cornerRadius={0} />
            <div className="collaborator-color" style={colorStyle} />
          </div>
        );
      })}
    </div>
  );
}

Collaborators.propTypes = {
  collaborators: React.PropTypes.arrayOf(React.PropTypes.shape({
    clientID: React.PropTypes.string.isRequired,
    name: React.PropTypes.string,
    email: React.PropTypes.string,
    color: React.PropTypes.string
  }))
};

export default Collaborators;
