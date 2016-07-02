const config = require('../config');
const logger = require('../logger');
const mongoose = require('mongoose');

function initialize() {
  return new Promise((resolve, reject) => {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongo);

    const db = mongoose.connection;
    db.on('error', err => {
      logger.error(`Database connection error: ${err}`);
      reject(err);
    });
    db.once('open', () => {
      logger.info('Database connection is ready');
      resolve();
    });
  });
}

module.exports = initialize;
