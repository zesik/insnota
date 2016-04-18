import React from 'react';
import {
  CONNECTION_CONNECTING,
  CONNECTION_WAITING,
  CONNECTION_CONNECTED,
  DOC_SYNCING,
  DOC_SYNCED
} from './SyncedEditor';

class EditorStatusBar extends React.Component {
  constructor() {
    super();
    this.handleLanguageModeChanged = this.handleLanguageModeChanged.bind(this);
  }

  handleLanguageModeChanged(event) {
    if (this.props.onLanguageModeChanged) {
      this.props.onLanguageModeChanged(event.target.value);
    }
  }

  render() {
    let connectionStatus;
    switch (this.props.connectionState) {
      case CONNECTION_CONNECTING:
        connectionStatus = (<div className="connection-status">Connecting...</div>);
        break;
      case CONNECTION_WAITING:
        connectionStatus = (
          <div className="connection-status">
            Waiting for {this.props.connectionWaitSeconds} second(s) before reconnecting
            (No. {this.props.connectionRetries})...
          </div>
        );
        break;
      case CONNECTION_CONNECTED:
        connectionStatus = (<div className="connection-status">Connected</div>);
        break;
      default:
        connectionStatus = (<div className="connection-status">Not Connected</div>);
        break;
    }

    let syncStatus;
    switch (this.props.documentState) {
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

    const languageModeSelect = (
      <select value={this.props.languageMode} onChange={this.handleLanguageModeChanged}>
        {
          this.props.languageModeList.map(
            item => (<option key={item.mimeType} value={item.mimeType}>{item.name}</option>))
        }
      </select>
    );

    return (
      <div className="status-bar">
        {connectionStatus}
        {syncStatus}
        <div className="cursor-status">
          {cursorPositions}
          {cursorSelections}
        </div>
        <div className="language-mode">
          {languageModeSelect}
        </div>
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
