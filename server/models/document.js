'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  _id: { type: String, index: true },
  title: String,
  owner: { type: String, required: true, index: true },
  viewable: { type: [String], index: true },
  editable: { type: [String], index: true },
  public_access: { type: String },
  editor_inviting: { type: Boolean },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

DocumentSchema.static('findOneByID', function (id, callback) {
  return this.findOne({ _id: id }, callback);
});

DocumentSchema.static('findByOwner', function (email, callback) {
  return this.find({ owner: email }, callback);
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
