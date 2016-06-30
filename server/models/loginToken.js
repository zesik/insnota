const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginTokenSchema = new Schema({
  _id: { type: String, index: true, unique: true },
  user_id: { type: Schema.Types.ObjectId },
  used: { type: Boolean, default: false },
  expires: { type: Date },
  created_at: { type: Date, default: Date.now }
});

const LoginToken = mongoose.model('LoginToken', LoginTokenSchema);

module.exports = LoginToken;
