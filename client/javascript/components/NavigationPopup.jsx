import React from 'react';

class NavigationPopup extends React.Component {
  constructor(props) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  componentDidMount() {
    this.refs.navigation.focus();
  }

  handleConfirm(e) {
    e.preventDefault();
    this.props.onConfirmNavigation(this.props.navigationText);
  }

  render() {
    return (
      <div className="status-popup popup-top-right" id="popup-navigation">
        <div className="btn btn-link popup-close-button" onClick={this.props.onClosePopup}>
          <i className="fa fa-close" />
        </div>
        <div className="popup-title">Navigate to Line</div>
        <form id="popup-navigation-content">
          <input
            ref="navigation"
            type="text"
            className="textbox"
            id="navigation-text"
            value={this.props.navigationText}
            onChange={(e) => this.props.onEditNavigationText(e.target.value)}
          />
          <button className="btn btn-default" type="submit" onClick={this.handleConfirm}>
            Go
          </button>
        </form>
      </div>
    );
  }
}

NavigationPopup.propTypes = {
  navigationText: React.PropTypes.string.isRequired,
  onEditNavigationText: React.PropTypes.func.isRequired,
  onConfirmNavigation: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired
};

export default NavigationPopup;
