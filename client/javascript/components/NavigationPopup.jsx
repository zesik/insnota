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
    this.props.onNavigation(this.refs.navigation.value);
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
  onNavigation: React.PropTypes.func.isRequired,
  onClosePopup: React.PropTypes.func.isRequired
};

export default NavigationPopup;
