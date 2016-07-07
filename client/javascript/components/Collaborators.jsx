import React from 'react';
import classNames from 'classnames';
import UserAvatar from './UserAvatar';
import PopupBox from './PopupBox';

const MAX_VISIBLE_COLLABORATOR_COUNT = 5;

function Collaborators({ collaborators, collaboratorCursorsVisible, onShowCursorChecked }) {
  if (collaborators.length === 0) {
    return (<div className="collaborator-list" />);
  }
  const visibleCollaborators = [];
  const moreCollaborators = [];
  collaborators.forEach((item, index) => {
    if (index < MAX_VISIBLE_COLLABORATOR_COUNT) {
      visibleCollaborators.push(item);
    } else {
      moreCollaborators.push(item);
    }
  });
  return (
    <div className="collaborator-list">
      {visibleCollaborators.map(item => (
        <div className="collaborator" key={item.clientID} title={item.email || 'Anonymous'}>
          <UserAvatar email={item.email} size={24} color={item.color} cornerRadius={0} />
          <div className={classNames({ 'collaborator-color': true, [`color-${item.color}`]: true })} />
        </div>
      ))}
      <PopupBox left>
        <div className="popup-collaborators">
          <div className="popup-collaborator-list">
            {moreCollaborators.map(item => (
              <div className="collaborator" key={item.clientID} title={item.email || 'Anonymous'}>
                <UserAvatar email={item.email} size={24} color={item.color} cornerRadius={0} />
                <div className={classNames({ 'collaborator-color': true, [`color-${item.color}`]: true })} />
              </div>
            ))}
          </div>
          <div className="popup-collaborator-settings form">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={collaboratorCursorsVisible}
                onChange={e => onShowCursorChecked(e.target.checked)}
              />
              Show cursors of online collaborators
            </label>
          </div>
        </div>
      </PopupBox>
    </div>
  );
}

Collaborators.propTypes = {
  collaborators: React.PropTypes.arrayOf(React.PropTypes.shape({
    clientID: React.PropTypes.string.isRequired,
    name: React.PropTypes.string,
    email: React.PropTypes.string,
    color: React.PropTypes.number
  })),
  collaboratorCursorsVisible: React.PropTypes.bool.isRequired,
  onShowCursorChecked: React.PropTypes.func.isRequired
};

export default Collaborators;
