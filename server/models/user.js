const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  kind: { type: String, default: 'normal' },
  status: String,
  tokens: [],
  password_attempts: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.statics.findOneByEmail = function (email, callback) {
  return this.findOne({ email }, callback);
};

UserSchema.statics.resetPasswordAttempt = function (id, callback) {
  return this.update({ _id: id }, { $set: { password_attempts: 0 } }, callback);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
