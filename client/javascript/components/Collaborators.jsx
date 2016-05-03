import React from 'react';
import md5 from 'md5';

function getAvatarURL(email) {
  if (email) {
    const hash = md5(email.trim().toLowerCase());
    return `https://secure.gravatar.com/avatar/${hash}?s=128`;
  }
  return '';
}

function Collaborators({ collaborators }) {
  return (
    <div className="collaborator-list">
      {collaborators.map(item => {
        const colors = item.color.split(':');
        const colorStyle = { backgroundColor: `#${colors[0]}` };
        const avatarStyle = {};
        const avatarURL = getAvatarURL(item.email);
        if (avatarURL) {
          avatarStyle.backgroundImage = avatarURL;
        } else {
          avatarStyle.backgroundColor = `#${colors[0]}`;
        }
        return (
          <div className="collaborator" key={item.clientID} title={item.email || 'Anonymous'}>
            <div className="collaborator-avatar" style={avatarStyle} />
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
