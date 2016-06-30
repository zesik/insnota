const config = require('../config');
const logger = require('../logger');
const mongoose = require('mongoose');

function initialize(callback) {
  mongoose.Promise = global.Promise;
  mongoose.connect(config.mongo);

  const db = mongoose.connection;
  db.on('error', error => logger.error(`Database connection error: ${error}`));
  db.once('open', function () {
    logger.info('Database connection is ready');
    callback();
  });
}

module.exports = initialize;
