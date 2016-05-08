import React from 'react';

function renderRecaptcha(id, siteKey) {
  return grecaptcha.render(id, { sitekey: siteKey });
}

class Recaptcha extends React.Component {
  constructor(props) {
    super(props);
    this.widgetID = null;
  }

  componentDidMount() {
    const { containerID, siteKey, callbackFunctionName } = this.props;
    if (typeof grecaptcha !== 'undefined') {
      this.widgetID = renderRecaptcha(containerID, siteKey);
    } else {
      window[callbackFunctionName] = () => this.widgetID = renderRecaptcha(containerID, siteKey);
    }
  }

  render() {
    return (<div id={this.props.containerID}></div>);
  }
}

Recaptcha.propTypes = {
  containerID: React.PropTypes.string.isRequired,
  callbackFunctionName: React.PropTypes.string.isRequired,
  siteKey: React.PropTypes.string.isRequired
};

Recaptcha.defaultProps = {
  containerID: 'recaptcha-container',
  callbackFunctionName: 'onRecaptchaLoaded'
};

export default Recaptcha;
