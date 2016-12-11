const { ClientError, ClientErrorCode } = require('../error');
const Document = require('../models/document');

/**
 * Create a new document.
 *
 * @params {string} id Document ID.
 * @params {string} collection Collection of the document in ShareDB.
 * @params {ObjectId} ownerID User ID of the owner.
 * @params {string} title Title of the document.
 * @returns {Promise}
 */
function createDocument(id, collection, ownerID, title) {
  const doc = new Document();
  doc._id = id;
  doc.doc_collection = collection;
  doc.owner = ownerID;
  doc.title = title;
  return doc.save().then(() => doc);
}

/**
 * Find a document by its ID.
 *
 * @params {string} id Document ID.
 * @returns {Promise}
 */
function find(id) {
  return Document.findOne({ _id: id }).exec()
    .then((doc) => {
      if (!doc || doc.deleted_at) {
        throw new ClientError(ClientErrorCode.ERROR_DOCUMENT_NOT_FOUND);
      }
      return doc;
    });
}

/**
 * @returns {Promise}
 */
function findByOwner(user) {
  return Document.find({ owner: user._id }).exec()
    .then(docs => docs.filter(doc => !doc.deleted_at));
}

/**
 * @returns {Promise}
 */
function findAccessible(user) {
  return Promise.all([
    Document.find({ owner: user._id }).exec().then(docs => docs.filter(doc => !doc.deleted_at)),
    Document.find({ viewable: user._id }).exec().then(docs => docs.filter(doc => !doc.deleted_at)),
    Document.find({ editable: user._id }).exec().then(docs => docs.filter(doc => !doc.deleted_at))
  ]).then((values) => {
    const addDocument = access => (collection, doc) => {
      doc.userAccess = access;
      collection.push(doc);
      return collection;
    };
    const docs = [];
    values[0].reduce(addDocument('owner'), docs);
    values[1].reduce(addDocument('viewable'), docs);
    values[2].reduce(addDocument('editable'), docs);
    return docs;
  });
}

module.exports = {
  createDocument,
  find,
  findByOwner,
  findAccessible
};
