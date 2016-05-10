import React from 'react';
import md5 from 'md5';

function getAvatarURL(email) {
  const hash = md5(email.toLowerCase());
  return `https://secure.gravatar.com/avatar/${hash}?s=192`;
}

function UserAvatar(props) {
  const email = (props.email || '').trim().toLowerCase();
  const size = props.size || 48;
  const cornerRadius = props.cornerRadius;
  const color = props.color || 'ffffff';
  const style = {
    width: size,
    height: size,
    borderRadius: cornerRadius
  };
  if (email) {
    style.backgroundSize = size;
    style.backgroundImage = `url(${getAvatarURL(email)})`;
  } else {
    style.backgroundColor = `#${color}`;
  }
  return (
    <div className="user-avatar" style={style} />
  );
}

UserAvatar.propTypes = {
  email: React.PropTypes.string,
  size: React.PropTypes.number,
  cornerRadius: React.PropTypes.number,
  color: React.PropTypes.string
};

export default UserAvatar;