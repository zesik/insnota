'use strict';

const Document = require('../models/document');

function findByOwner(email, callback) {
  Document.findByOwner(email, callback);
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
  create
};