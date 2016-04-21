'use strict';

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

const db = mongoose.connection;
db.on('error', error => console.error('Database connection error: ' + error));
db.once('open', function() {
  console.log('Database is ready');
});
