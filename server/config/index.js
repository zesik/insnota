const fs = require('fs');
const consts = require('./const');
const defaultConfig = require('./default');

// TODO: convert environment variable from string to applicable types and sanitize data
function loadConfig() {
  // Try to load config from config file
  let localConfig = {};
  if (fs.existsSync(process.env.CONFIG_FILE)) {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    localConfig = require(process.env.CONFIG_FILE);
  }
  return Object.keys(defaultConfig)
    .filter(key => key in process.env)
    .reduce((config, key) => {
      config[key] = process.env[key];
      return config;
    }, Object.assign({}, consts, defaultConfig, localConfig));
}

module.exports = loadConfig();
