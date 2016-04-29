'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  _id: { type: String, index: true },
  title: String,
  owner: { type: String, required: true, index: true },
  viewable: { type: [String], index: true },
  editable: { type: [String], index: true },
  public_viewable: Boolean,
  public_editable: Boolean,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

DocumentSchema.static('findByOwner', function (email, callback) {
  return this.find({ owner: email }, callback);
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
