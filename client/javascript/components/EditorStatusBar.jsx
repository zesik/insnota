import React from 'react';
import classNames from 'classnames';
import LanguageModePopup from './LanguageModePopup';
import NavigationPopup from './NavigationPopup';
import { NET_CONNECTED, NET_CONNECTING, NET_WAITING, DOC_SYNCED } from './SyncedEditor';

function formatSeconds(seconds) {
  if (seconds > 1) {
    return `${seconds} seconds`;
  }
  return `${seconds} second`;
}

class EditorStatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggleNavigationPopup = this.handleToggleNavigationPopup.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleToggleLanguageModePopup = this.handleToggleLanguageModePopup.bind(this);
    this.handleEditLanguageModeFilter = this.handleEditLanguageModeFilter.bind(this);
    this.handleChangeLanguageMode = this.handleChangeLanguageMode.bind(this);
    this.state = {
      navigationPopupVisible: false,
      languageModePopupVisible: false,
      languageModeFilter: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.docFocused) {
      this.setState({ navigationPopupVisible: false, languageModePopupVisible: false });
    }
  }

  handleToggleNavigationPopup() {
    this.setState({
      navigationPopupVisible: !this.state.navigationPopupVisible,
      languageModePopupVisible: false
    });
  }

  handleNavigation(navigationTarget) {
    this.setState({ navigationPopupVisible: false });
    if (this.props.onNavigation) {
      this.props.onNavigation(navigationTarget);
    }
  }

  handleToggleLanguageModePopup() {
    if (this.state.languageModePopupVisible) {
      this.setState({
        navigationPopupVisible: false,
        languageModePopupVisible: false
      });
    } else {
      this.setState({
        navigationPopupVisible: false,
        languageModePopupVisible: !this.props.readOnly,
        languageModeFilter: ''
      });
    }
  }

  handleEditLanguageModeFilter(filter) {
    this.setState({ languageModeFilter: filter });
  }

  handleChangeLanguageMode(languageMode) {
    this.setState({ languageModePopupVisible: false });
    if (this.props.onChangeLanguageMode) {
      this.props.onChangeLanguageMode(languageMode);
    }
  }

  render() {
    // Detailed synchronization status text
    let syncTitle;
    switch (this.props.netStatus) {
      case NET_CONNECTING:
        syncTitle = 'Connecting...';
        break;
      case NET_WAITING:
        syncTitle = `Disconnected. Retrying connection to the server in ${formatSeconds(this.props.netRetryWait)}...`;
        break;
      case NET_CONNECTED:
        if (this.props.docStatus === DOC_SYNCED) {
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
    if (this.props.netRetryCount < 3) {
      // Won't display error when retry time less than 3
      if (this.props.docStatus === DOC_SYNCED) {
        syncStatus = (
          <div className="status-bar-item-content icon-button" title={syncTitle}>
            <i className="material-icons small">cloud_done</i>
          </div>
        );
      } else {
        syncStatus = (
          <div className="status-bar-item-content icon-button" title={syncTitle}>
            <svg width="12" height="14" viewBox="0 0 12 14">
              <clipPath id="cloud-icon-clip">
                <text x="0" y="13px">&#xe2bd;</text>
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
          <i className="material-icons small">error</i>
        </div>
      );
    }

    let cursorInformation;
    // Cursor positions
    if (this.props.cursors.length === 0) {
      cursorInformation = '';
    } else if (this.props.cursors.length === 1) {
      const cursor = this.props.cursors[0].head;
      if (this.props.cursorCharsVisible) {
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
      'popup-open': this.state.navigationPopupVisible
    });

    // Language mode selections
    let currentLanguageMode = this.props.languageModeList.find(item => item.mimeType === this.props.languageMode);
    if (!currentLanguageMode) {
      currentLanguageMode = this.props.languageModeList.find(item => item.mimeType === 'text/plain');
    }
    const languageSelectionClasses = classNames({
      'status-bar-item': true,
      'popup-open': this.state.languageModePopupVisible
    });

    // Sharing setting
    let sharingIcon;
    switch (this.props.sharing) {
      case 'team':
        sharingIcon = (<i className="material-icons small">group</i>);
        break;
      case 'public':
        sharingIcon = (<i className="material-icons small">public</i>);
        break;
      default:
        sharingIcon = (<i className="material-icons small">lock</i>);
        break;
    }

    return (
      <div className="status-bar">
        <div className="status-bar-item" id="sync-status">
          {syncStatus}
        </div>
        <div className={cursorStatusClasses}>
          <div className="status-bar-item-content" onClick={this.handleToggleNavigationPopup}>
            {cursorInformation}
          </div>
          {this.state.navigationPopupVisible &&
            <NavigationPopup
              onNavigation={this.handleNavigation}
              onClosePopup={this.handleToggleNavigationPopup}
            />
          }
        </div>
        <div className="status-bar-item flex-width" />
        <div className={languageSelectionClasses}>
          <div className="status-bar-item-content" onClick={this.handleToggleLanguageModePopup}>
            {currentLanguageMode.name}
          </div>
          {this.state.languageModePopupVisible &&
            <LanguageModePopup
              currentMode={currentLanguageMode}
              fullModeList={this.props.languageModeList}
              filterText={this.state.languageModeFilter}
              onEditFilterText={this.handleEditLanguageModeFilter}
              onChangeLanguageMode={this.handleChangeLanguageMode}
              onClosePopup={this.handleToggleLanguageModePopup}
            />
          }
        </div>
        <div className="status-bar-item">
          <div className="status-bar-item-content icon-button" onClick={this.props.onOpenPermissionModal}>
            {sharingIcon}
          </div>
        </div>
      </div>
    );
  }
}

EditorStatusBar.propTypes = {
  // Document status
  netStatus: React.PropTypes.string.isRequired,
  netRetryCount: React.PropTypes.number.isRequired,
  netRetryWait: React.PropTypes.number.isRequired,
  docStatus: React.PropTypes.string.isRequired,
  docFocused: React.PropTypes.bool.isRequired,
  readOnly: React.PropTypes.bool.isRequired,
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
  cursorCharsVisible: React.PropTypes.bool,
  // Navigation
  onNavigation: React.PropTypes.func.isRequired,
  // Language mode
  languageMode: React.PropTypes.string.isRequired,
  languageModeList: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    mimeType: React.PropTypes.string.isRequired
  })).isRequired,
  onChangeLanguageMode: React.PropTypes.func.isRequired,
  // Permissions
  sharing: React.PropTypes.string.isRequired,
  onOpenPermissionModal: React.PropTypes.func.isRequired
};

export default EditorStatusBar;
