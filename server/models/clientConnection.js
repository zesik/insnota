const config = require('../config');
const logger = require('../logger');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClientConnectionSchema = new Schema({
  client_id: { type: String, required: true, unique: true },
  subscriptions: [{ c: String, d: String, t: Number }],
  created_at: { type: Date, default: Date.now }
});

/**
 * @returns {Promise}
 */
ClientConnectionSchema.statics.purgeSubscriptions = function (clientID, collection, document) {
  const query = {};
  if (clientID) {
    query.client_id = clientID;
  }
  let promise = null;
  if (collection || document) {
    promise = this.update(query,
      { $pull: { subscriptions: { c: collection, d: document } } },
      { multi: true });
  } else {
    promise = this.remove(query);
  }
  return promise;
};

const ClientConnection = mongoose.model('ClientConnection', ClientConnectionSchema, `connections_${config.serverID}`);

module.exports = ClientConnection;
