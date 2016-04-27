import React from 'react';

function Collaborators({ collaborators }) {
  return (
    <div className="collaborator-list">
      {collaborators.map(item => {
        const colors = item.color.split(':');
        const style = {
          backgroundColor: `#${colors[0]}`,
          color: `#${colors[1]}`
        };
        return (
          <div className="collaborator" key={item.clientID}>
            <div style={style}>{item.email || 'Anonymous'}</div>
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
