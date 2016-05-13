import React from 'react';

class LanguageModePopup extends React.Component {
  componentDidMount() {
    this.refs.filter.focus();
  }

  render() {
    const filteredModeList = this.props.fullModeList.filter(
      item => item.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) !== -1);
    return (
      <div className="status-popup-container">
        <div className='status-popup popup-top-left popup-open' id="popup-language-selection">
          <div className="popup-tab" onClick={this.props.onClosePopup}>
            {this.props.currentMode.name}
          </div>
          <div className="btn btn-link popup-close-button" onClick={this.props.onClosePopup}>
            <i className="fa fa-close"/>
          </div>
          <div className="popup-title">Language Mode</div>
          <input
            ref="filter"
            type="text"
            className="textbox"
            id="language-selection-filter"
            value={this.props.filterText}
            onChange={(e) => this.props.onEditFilterText(e.target.value)}
          />
          <div id="language-selection-list">
            {filteredModeList.length === 0 &&
              <div className="language-selection-empty">
                No matching language mode available
              </div>
            }
            {filteredModeList.map(item => (
              <a
                className="language-selection-item"
                key={item.mimeType}
                onClick={() => this.props.onModeChanged(item.mimeType)}
              >
                <div className="language-mode-name">{item.name}</div>
                {item.mimeType === this.props.currentMode.mimeType &&
                <div className="language-mode-current">Current Mode</div>
                }
              </a>
            ))}
          </div>
        </div>
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
  onModeChanged: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired
};

export default LanguageModePopup;
