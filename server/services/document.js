const Document = require('../models/document');

function findByOwner(email, callback) {
  Document.findByOwner(email, (err, docs) => {
    if (err) {
      return callback(err);
    }
    return callback(null, docs.filter(doc => !doc.deleted_at));
  });
}

function findByID(id, callback) {
  Document.findOne({ _id: id }, (err, doc) => {
    if (err) {
      return callback(err);
    }
    if (doc.deleted_at) {
      return callback();
    }
    return callback(null, doc);
  });
}

function create(id, owner, title, callback) {
  const document = new Document();
  document._id = id;
  document.owner = owner;
  document.title = title;
  document.save(callback);
}

module.exports = {
  findByOwner,
  findByID,
  create
};
