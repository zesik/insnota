import React from 'react';

class LanguageModePopup extends React.Component {
  componentDidMount() {
    this.refs.filter.focus();
  }

  render() {
    const filteredModeList = this.props.fullModeList.filter(
      item => item.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) !== -1);
    return (
      <div className="status-popup popup-top-left" id="popup-language-selection">
        <div className="btn btn-link popup-close-button" onClick={this.props.onClosePopup}>
          <i className="fa fa-close" />
        </div>
        <div className="popup-title">Language Mode</div>
        <input
          ref="filter"
          type="text"
          className="textbox"
          id="language-selection-filter"
          value={this.props.filterText}
          placeholder="Filter"
          onChange={(e) => this.props.onEditFilterText(e.target.value)}
        />
        <ul id="language-selection-list">
          {filteredModeList.length === 0 &&
            <li className="language-selection-empty">
              No match found
            </li>
          }
          {filteredModeList.map(item => (
            <li
              className="language-selection-item"
              key={item.mimeType}
              onClick={() => this.props.onChangeLanguageMode(item.mimeType)}
            >
              <div className="language-mode-name">{item.name}</div>
              {item.mimeType === this.props.currentMode.mimeType &&
                <div className="language-mode-current">Current Mode</div>
              }
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

LanguageModePopup.propTypes = {
  currentMode: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    mimeType: React.PropTypes.string.isRequired
  }).isRequired,
  filterText: React.PropTypes.string.isRequired,
  fullModeList: React.PropTypes.arrayOf(React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    mimeType: React.PropTypes.string.isRequired
  })).isRequired,
  onEditFilterText: React.PropTypes.func.isRequired,
  onChangeLanguageMode: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired
};

export default LanguageModePopup;
