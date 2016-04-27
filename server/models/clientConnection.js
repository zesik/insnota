'use strict';

const config = require('../config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientConnectionSchema = new Schema({
  client_id: { type: String, required: true, unique: true },
  subscriptions: [{ c: String, d: String, t: Number }],
  created_at: { type: Date, default: Date.now }
});

ClientConnectionSchema.static('purgeSubscriptions', function (clientID, collection, document, callback) {
  const query = {};
  if (clientID) {
    query.client_id = clientID;
  }
  let promise = null;
  if (collection || document) {
    promise = this.collection.update(query,
      { $pull: { subscriptions: { c: collection, d: document } } },
      { multi: true });
  } else {
    promise = this.collection.remove(query);
  }
  promise.then(function (result) {
    if (result.result.ok) {
      callback();
    } else {
      callback(result);
    }
  });
});

const ClientConnection = mongoose.model('ClientConnection', ClientConnectionSchema, `connections_${config.serverID}`);

module.exports = ClientConnection;
