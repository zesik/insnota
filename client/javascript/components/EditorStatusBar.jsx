import React from 'react';
import { DOC_SYNCING, DOC_SYNCED } from './SyncedEditor';

class EditorStatusBar extends React.Component {
  render() {
    let syncStatus;
    switch (this.props.state) {
      case DOC_SYNCING:
        syncStatus = (<div className="sync-status">Saving...</div>);
        break;
      case DOC_SYNCED:
        syncStatus = (<div className="sync-status">Saved to cloud</div>);
        break;
      default:
        syncStatus = (<div className="sync-status" />);
        break;
    }

    let cursorPositions;
    if (this.props.cursors.length === 0) {
      cursorPositions = (<div className="position" />);
    } else if (this.props.cursors.length === 1) {
      const cursor = this.props.cursors[0].head;
      let content;
      if (this.props.showCursorChars) {
        content = `Ln ${cursor.ln}, Col ${cursor.col}, Ch ${cursor.ch}`;
      } else {
        content = `Ln ${cursor.ln}, Col ${cursor.col}`;
      }
      cursorPositions = (
        <div className="position">
          {content}
        </div>
      );
    } else {
      cursorPositions = (
        <div className="position">
          {this.props.cursors.length} selections
        </div>
      );
    }

    let cursorSelections;
    let selectionLength = 0;
    for (let i = 0; i < this.props.cursors.length; ++i) {
      selectionLength += this.props.cursors[i].length;
    }
    if (selectionLength === 0) {
      cursorSelections = (<div className="selection" />);
    } else {
      cursorSelections = (<div className="selection">({selectionLength} selected)</div>);
    }

    return (
      <div className="status-bar">
        {syncStatus}
        <div className="cursor-status">
          {cursorPositions}
          {cursorSelections}
        </div>
      </div>
    );
  }
}

EditorStatusBar.propTypes = {
  state: React.PropTypes.string,
  cursors: React.PropTypes.arrayOf(React.PropTypes.shape({
    anchor: React.PropTypes.shape({
      ln: React.PropTypes.number.isRequired,
      col: React.PropTypes.number.isRequired,
      ch: React.PropTypes.number.isRequired
    }).isRequired,
    head: React.PropTypes.shape({
      ln: React.PropTypes.number.isRequired,
      col: React.PropTypes.number.isRequired,
      ch: React.PropTypes.number.isRequired
    }).isRequired,
    length: React.PropTypes.number.isRequired,
    primary: React.PropTypes.bool
  })),
  showCursorChars: React.PropTypes.bool
};

export default EditorStatusBar;
