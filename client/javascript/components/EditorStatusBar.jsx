import React from 'react';
import {
  CONNECTION_CONNECTING,
  CONNECTION_WAITING,
  CONNECTION_CONNECTED,
  DOC_SYNCED
} from './SyncedEditor';

function formatSecondCounter(seconds) {
  if (seconds > 1) {
    return `${seconds} seconds`;
  }
  return `${seconds} second`;
}

class EditorStatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
  }

  handleLanguageModeChanged(event) {
    if (this.props.onLanguageModeChanged) {
      this.props.onLanguageModeChanged(event.target.value);
    }
  }

  render() {
    // Detailed synchronization status text
    let syncTitle;
    switch (this.props.connectionState) {
      case CONNECTION_CONNECTING:
        syncTitle = 'Connecting...';
        break;
      case CONNECTION_WAITING:
        syncTitle = `Retrying connection to the server in ${formatSecondCounter(this.props.connectionWaitSeconds)}...`;
        break;
      case CONNECTION_CONNECTED:
        if (this.props.documentState === DOC_SYNCED) {
          syncTitle = 'All changes are saved to the cloud';
        } else {
          syncTitle = 'Saving changes...';
        }
        break;
      default:
        syncTitle = 'Not connected';
        break;
    }

    // Synchronization status icon
    let syncStatus;
    if (this.props.connectionRetries < 3) {
      // Won't display error when retry time less than 3
      if (this.props.documentState === DOC_SYNCED) {
        syncStatus = (<div className="status-bar-item icon-button sync-status" title={syncTitle}>&#xf0c2;</div>);
      } else {
        syncStatus = (
          <div className="status-bar-item icon-button sync-status" title={syncTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14">
              <clipPath id="cloud-icon-clip">
                <text textAnchor="middle" x="50%" y="50%" dy=".35em">&#xf0c2;</text>
              </clipPath>
              <pattern id="cloud-icon-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect x="-1" y="-1" width="120%" height="120%" fill="rgb(117,117,117)" />
                <g stroke="rgba(255,255,255,.4)" strokeWidth="2.8">
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" />
                </g>
              </pattern>
              <g clipPath="url(#cloud-icon-clip)">
                <rect x="-8" y="0" width="24" height="14" className="cloud-icon-fill" />
              </g>
            </svg>
          </div>
        );
      }
    } else {
      syncStatus = (
        <div className="status-bar-item icon-button sync-status disconnected" title={syncTitle}>
          <i className="fa fa-exclamation-circle" />
        </div>
      );
    }

    // Cursor positions
    let cursorPositions;
    if (this.props.cursors.length === 0) {
      cursorPositions = (<div className="cursor-position" />);
    } else if (this.props.cursors.length === 1) {
      const cursor = this.props.cursors[0].head;
      let content;
      if (this.props.showCursorChars) {
        content = `Ln ${cursor.ln}, Col ${cursor.col}, Ch ${cursor.ch}`;
      } else {
        content = `Ln ${cursor.ln}, Col ${cursor.col}`;
      }
      cursorPositions = (<div className="cursor-position">{content}</div>);
    } else {
      cursorPositions = (<div className="cursor-position">{this.props.cursors.length} selections</div>);
    }

    // Cursor selections
    let cursorSelections;
    let selectionLength = 0;
    for (let i = 0; i < this.props.cursors.length; ++i) {
      selectionLength += this.props.cursors[i].length;
    }
    if (selectionLength === 0) {
      cursorSelections = (<div className="cursor-selection" />);
    } else {
      cursorSelections = (<div className="cursor-selection">&nbsp;({selectionLength} selected)</div>);
    }

    // Combining cursor information
    const cursorStatus = (<div className="status-bar-item cursor-status">{cursorPositions}{cursorSelections}</div>);

    // Language mode selections
    const languageModeSelection = (
      <div className="status-bar-item language-selection">
        <select value={this.props.languageMode} onChange={this.handleLanguageModeChanged}>
          {this.props.languageModeList.map(item => (
            <option key={item.mimeType} value={item.mimeType}>{item.name}</option>
          ))}
        </select>
      </div>
    );

    return (
      <div className="status-bar">
        {syncStatus}
        {cursorStatus}
        <div className="status-bar-item flex-width" />
        {languageModeSelection}
      </div>
    );
  }
}

EditorStatusBar.propTypes = {
  connectionState: React.PropTypes.string,
  connectionRetries: React.PropTypes.number,
  connectionWaitSeconds: React.PropTypes.number,
  documentState: React.PropTypes.string,
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
  showCursorChars: React.PropTypes.bool,
  languageModeList: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    mimeType: React.PropTypes.string.isRequired
  })),
  languageMode: React.PropTypes.string,
  onLanguageModeChanged: React.PropTypes.func
};

export default EditorStatusBar;
