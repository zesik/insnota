const Document = require('../models/document');
const config = require('../config');
const logger = require('../logger');

/**
 * @note reject() argument types: Error object or null (when document not found or deleted)
 */
function find(id) {
  return new Promise((resolve, reject) => {
    Document.findOne({ _id: id }, (err, doc) => {
      if (err) {
        logger.error('Database error when finding document');
        reject(err);
        return;
      }
      if (!doc || doc.deleted_at) {
        reject();
        return;
      }
      resolve(doc);
    });
  });
}

function findByOwner(userID) {
  return new Promise((resolve, reject) => {
    Document.findByOwner(userID, (err, docs) => {
      if (err) {
        logger.error('Database error when finding documents');
        reject(err);
        return;
      }
      resolve(docs.filter(doc => !doc.deleted_at));
    });
  });
}

function create(id, ownerID, title) {
  return new Promise((resolve, reject) => {
    const doc = new Document();
    doc._id = id;
    doc.owner_collection = config.documentCollection;
    doc.owner = ownerID;
    doc.title = title;
    doc.save(err => {
      if (err) {
        logger.error('Database error when creating document');
        reject(err);
        return;
      }
      resolve(doc);
    });
  });
}

module.exports = {
  findByOwner,
  find,
  create
};
