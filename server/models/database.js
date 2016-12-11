const config = require('../config');
const logger = require('../logger');
const mongoose = require('mongoose');

/**
 * @returns {Promise}
 */
function initialize() {
  mongoose.Promise = global.Promise;
  return mongoose.connect(config.MONGO_URI)
    .then(() => {
      logger.info('Database connected');
    })
    .catch((err) => {
      logger.error(`Database connection error: ${err}`);
      return err;
    });
}

module.exports = initialize;
