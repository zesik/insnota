import React from 'react';
import classNames from 'classnames';

class Document extends React.Component {
  render() {
    const elementClasses = classNames({
      document: true,
      selected: this.props.selected
    });
    return (
      <div className={elementClasses} onClick={this.props.onClick}>
        <div className="title">{this.props.title}</div>
        <div className="last-modified">{this.props.lastModified}</div>
        <div className="permission"></div>
      </div>
    );
  }
}

Document.propTypes = {
  title: React.PropTypes.string,
  lastModified: React.PropTypes.string,
  selected: React.PropTypes.bool,
  onClick: React.PropTypes.func
};

export default Document;
