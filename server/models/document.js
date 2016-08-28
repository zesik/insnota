const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  _id: { type: String, index: true },
  owner_collection: { type: String },
  title: String,
  owner: { type: Schema.Types.ObjectId, index: true },
  viewable: { type: [Schema.Types.ObjectId], index: true },
  editable: { type: [Schema.Types.ObjectId], index: true },
  public_access: { type: String },
  editor_inviting: { type: Boolean },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null }
});

DocumentSchema.statics.findByOwner = function (id, callback) {
  return this.find({ owner: id }, callback);
};

DocumentSchema.statics.findViewableByUser = function (id, callback) {
  return this.find({ viewable: id }, callback);
};

DocumentSchema.statics.findEditableByUser = function (id, callback) {
  return this.find({ editable: id }, callback);
};

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
