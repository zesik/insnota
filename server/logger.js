const moment = require('moment');
const winston = require('winston');

const logger = new (winston.Logger)({
  level: 'verbose',
  transports: [
    new (winston.transports.Console)({
      timestamp: () => moment().format(),
      formatter: options => `${options.timestamp()} [${options.level.toUpperCase()}] ${options.message || ''}`
    })
  ]
});

module.exports = logger;
