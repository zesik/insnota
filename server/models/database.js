'use strict';

const config = require('../config');
const mongoose = require('mongoose');

function initialize(callback) {
  mongoose.connect(config.mongo);

  const db = mongoose.connection;
  db.on('error', error => console.error('Database connection error: ' + error));
  db.once('open', function() {
    console.log('Database is ready');
    callback();
  });
}

module.exports = initialize;
