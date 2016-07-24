import React from 'react';

function PopupMenu(props) {
  const children = React.Children.map(props.children,
    child => React.cloneElement(child, { onClose: props.onClose })
  );
  return (
    <div className="popup-menu-container">{children}</div>
  );
}

PopupMenu.propTypes = {
  onClose: React.PropTypes.func,
  children: React.PropTypes.arrayOf(React.PropTypes.element).isRequired
};

export default PopupMenu;
