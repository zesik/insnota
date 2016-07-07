const fs = require('fs');
const layerize = require('./layerize');
const config = require('./app.config');

let localConfig = {};
if (fs.existsSync('./local.config.js')) {
  localConfig = require('./local.config');
}

const parsedConfig = layerize(Object.assign({}, config, localConfig));

module.exports = parsedConfig;
