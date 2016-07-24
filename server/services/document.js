const Document = require('../models/document');
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

function findAccessible(userID) {
  return new Promise((resolve, reject) => {
    Document.findByOwner(userID, (errOwner, ownedDocs) => {
      if (errOwner) {
        logger.error('Database error when finding documents');
        reject(errOwner);
        return;
      }
      Document.findViewableByUser(userID, (errViewable, viewableDocs) => {
        if (errViewable) {
          logger.error('Database error when finding documents');
          reject(errViewable);
          return;
        }
        Document.findEditableByUser(userID, (errEditable, editableDocs) => {
          if (errEditable) {
            logger.error('Database error when finding documents');
            reject(errEditable);
            return;
          }
          const docs = [];
          const addDocument = access => doc => {
            if (doc.deleted_at) {
              return;
            }
            doc.userAccess = access;
            docs.push(doc);
          };
          ownedDocs.forEach(addDocument('owner'));
          viewableDocs.forEach(addDocument('viewable'));
          editableDocs.forEach(addDocument('editable'));
          resolve(docs);
        });
      });
    });
  });
}

function create(id, collection, ownerID, title) {
  return new Promise((resolve, reject) => {
    const doc = new Document();
    doc._id = id;
    doc.owner_collection = collection;
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
  find,
  findByOwner,
  findAccessible,
  create
};
