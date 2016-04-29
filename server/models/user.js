'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  kind: { type: String, default: 'normal' },
  status: String,
  tokens: [],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.static('findOneByEmail', function (email, callback) {
  return this.findOne({ email }, callback);
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
