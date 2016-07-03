import React from 'react';

function PopupMenu(props) {
  return (
    <div className="popup-menu-container">{props.children}</div>
  );
}

PopupMenu.propTypes = {
  children: React.PropTypes.element.isRequired
};

export default PopupMenu;
