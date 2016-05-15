import React from 'react';
import classNames from 'classnames';
import LanguageModePopup from './LanguageModePopup';
import NavigationPopup from './NavigationPopup';
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
        syncStatus = (
          <div className="status-bar-item-content icon-button" title={syncTitle}>
            <i className="fa fa-cloud" />
          </div>
        );
      } else {
        syncStatus = (
          <div className="status-bar-item-content icon-button" title={syncTitle}>
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
        <div className="status-bar-item-content icon-button disconnected" title={syncTitle}>
          <i className="fa fa-exclamation-circle" />
        </div>
      );
    }

    let cursorInformation;
    // Cursor positions
    if (this.props.cursors.length === 0) {
      cursorInformation = '';
    } else if (this.props.cursors.length === 1) {
      const cursor = this.props.cursors[0].head;
      if (this.props.showCursorChars) {
        cursorInformation = `Ln ${cursor.ln}, Col ${cursor.col}, Ch ${cursor.ch}`;
      } else {
        cursorInformation = `Ln ${cursor.ln}, Col ${cursor.col}`;
      }
    } else {
      cursorInformation = `${this.props.cursors.length} selections`;
    }
    // Cursor selections
    let selectionLength = 0;
    for (let i = 0; i < this.props.cursors.length; ++i) {
      selectionLength += this.props.cursors[i].length;
    }
    if (selectionLength > 0) {
      cursorInformation += ` (${selectionLength} selected)`;
    }
    const cursorStatusClasses = classNames({
      'status-bar-item': true,
      'popup-open': this.props.navigationPopupVisible
    });

    // Language mode selections
    let currentLanguageMode = this.props.languageModeList.find(item => item.mimeType === this.props.languageMode);
    if (!currentLanguageMode) {
      currentLanguageMode = this.props.languageModeList.find(item => item.mimeType === 'text/plain');
    }
    const languageSelectionClasses = classNames({
      'status-bar-item': true,
      'popup-open': this.props.languageModeListVisible
    });

    return (
      <div className="status-bar">
        <div className="status-bar-item" id="sync-status">
          {syncStatus}
        </div>
        <div className={cursorStatusClasses}>
          <div className="status-bar-item-content" onClick={this.props.onToggleNavigationPopup}>
            {cursorInformation}
          </div>
          {this.props.navigationPopupVisible &&
            <NavigationPopup
              navigationText={this.props.navigationText}
              onEditNavigationText={this.props.onEditNavigationText}
              onConfirmNavigation={this.props.onConfirmNavigation}
              onClosePopup={this.props.onToggleNavigationPopup}
            />
          }
        </div>
        <div className="status-bar-item flex-width" />
        <div className={languageSelectionClasses}>
          <div className="status-bar-item-content" onClick={this.props.onToggleLanguageModeList}>
            {currentLanguageMode.name}
          </div>
          {this.props.languageModeListVisible &&
            <LanguageModePopup
              currentMode={currentLanguageMode}
              fullModeList={this.props.languageModeList}
              filterText={this.props.languageModeListFilter}
              onEditFilterText={this.props.onEditLanguageModeListFilter}
              onChangeLanguageMode={this.props.onChangeLanguageMode}
              onClosePopup={this.props.onToggleLanguageModeList}
            />
          }
        </div>
        <div className="status-bar-item">
          <div className="status-bar-item-content icon-button" onClick={this.props.onOpenPermissionModal}>
            <i className="fa fa-lock" />
          </div>
        </div>
      </div>
    );
  }
}

EditorStatusBar.propTypes = {
  // Document sync status
  connectionState: React.PropTypes.string.isRequired,
  connectionRetries: React.PropTypes.number.isRequired,
  connectionWaitSeconds: React.PropTypes.number.isRequired,
  documentState: React.PropTypes.string.isRequired,
  // Cursor information
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
  })).isRequired,
  showCursorChars: React.PropTypes.bool,
  // Navigation
  navigationPopupVisible: React.PropTypes.bool.isRequired,
  navigationText: React.PropTypes.string.isRequired,
  onToggleNavigationPopup: React.PropTypes.func.isRequired,
  onEditNavigationText: React.PropTypes.func.isRequired,
  onConfirmNavigation: React.PropTypes.func.isRequired,
  // Language mode
  languageMode: React.PropTypes.string.isRequired,
  languageModeListVisible: React.PropTypes.bool.isRequired,
  languageModeListFilter: React.PropTypes.string.isRequired,
  languageModeList: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    mimeType: React.PropTypes.string.isRequired
  })).isRequired,
  onToggleLanguageModeList: React.PropTypes.func.isRequired,
  onEditLanguageModeListFilter: React.PropTypes.func.isRequired,
  onChangeLanguageMode: React.PropTypes.func.isRequired,
  // Permissions
  permission: React.PropTypes.string.isRequired,
  onOpenPermissionModal: React.PropTypes.func.isRequired
};

export default EditorStatusBar;
