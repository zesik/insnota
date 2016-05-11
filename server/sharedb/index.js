'use strict';

const async = require('async');
const config = require('../config');
const sharedb = require('sharedb');
const sharedbDatabase = require('sharedb-mongo')(config.mongo);
const SocketStream = require('./socket-stream');
const ClientConnection = require('../models/clientConnection');
const Document = require('../models/document');

const DEFAULT_DOCUMENT = {
  a: {},                // Collaborators
  t: 'Untitled',        // Title
  c: '',                // Content
  m: 'text/plain'       // MIME type
};

// Initialize ShareDB
const backend = sharedb({ db: sharedbDatabase });
require('sharedb-logger')(backend);
backend.use('connect', handleShareDBConnect);
backend.use('receive', handleShareDBReceive);
const serverConnection = backend.connect();

function handleClientConnected(clientID, user, collection, document, callback) {
  const timestamp = Date.now();
  ClientConnection.findOne({ client_id: clientID }, function (err, clientConnection) {
    if (err) {
      return callback(err);
    }
    // Append current connection to the active connection list
    if (!clientConnection) {
      clientConnection = new ClientConnection();
      clientConnection.client_id = clientID;
      clientConnection.subscriptions = [];
    }
    clientConnection.subscriptions.push({ c: collection, d: document, t: timestamp });
    clientConnection.save(function (err) {
      if (err) {
        return callback(err);
      }
      // Append current connection to the document itself
      const sharedbDoc = serverConnection.get(collection, document);
      sharedbDoc.fetch(function (err) {
        if (err) {
          return callback(err);
        }
        if (!sharedbDoc.data.a) {
          sharedbDoc.submitOp({ p: ['a'], oi: {} }, true);
        }
        const clientInfo = { t: timestamp, c: [] };
        if (user) {
          clientInfo.e = user.email;
          clientInfo.n = user.name;
        }
        sharedbDoc.submitOp({ p: ['a', clientID], oi: clientInfo }, true);
        callback();
      });
    });
  });
}

function handleClientDisconnected(clientID, collection, document, callback) {
  const query = {};
  if (clientID) {
    query.client_id = clientID;
  }
  ClientConnection.find(query, function (err, docs) {
    if (err) {
      return callback(err);
    }
    async.map(docs, function (doc, callback) {
      async.mapSeries(doc.subscriptions, function(subscription, callback) {
        const sharedbDoc = serverConnection.get(subscription.c, subscription.d);
        sharedbDoc.fetch(function (err) {
          if (err) {
            return callback(err);
          }
          if (!sharedbDoc.type) {
            // Document does not exist any more.
            return callback();
          }
          if (sharedbDoc.data.a) {
            let clientInfo = sharedbDoc.data.a[doc.client_id];
            if (clientInfo) {
              sharedbDoc.submitOp({p: ['a', doc.client_id], od: clientInfo});
            }
          }
          callback();
        });
      }, function (err) {
        callback(err);
      });
    }, function (err) {
      if (err) {
        return callback(err);
      }
      ClientConnection.purgeSubscriptions(clientID, collection, document, callback);
    });
  });
}

function handleShareDBConnect(req, next) {
  const clientID = req.agent.clientId;
  if (req.stream.isServer) {
    console.log(`ShareDB connected: ${clientID}, (Server)`);
  } else {
    const user = req.stream.user ? req.stream.user.email : '(Anonymous)';
    const remoteAddress = req.stream.remoteAddress;
    console.log(`ShareDB connected: ${clientID}, ${remoteAddress}, ${user}`);
  }
  return next();
}

function handleShareDBReceive(req, next) {
  switch (req.data.a) {
    case 'bs':
    case 's':
      if (!req.agent.stream.isServer) {
        handleClientConnected(req.agent.clientId, req.agent.stream.user, req.data.c, req.data.d, next);
      }
      break;
    case 'bu':
    case 'u':
      if (!req.agent.stream.isServer) {
        handleClientDisconnected(req.agent.clientId, req.data.c, req.data.d, next);
      }
      break;
    case 'op':
      if (req.data.op) {
        for (let i = 0; i < req.data.op.length; ++i) {
          if (req.data.op[i].p[0] === 't') {
            const newTitle = req.data.op[i].oi;
            Document.update({ _id: req.data.d }, { title: newTitle }).exec();
          }
        }
      }
      return next();
    default:
      return next();
  }
}

function handleSocketConnection(ws, req) {
  const stream = new SocketStream(ws, req);
  const agent = backend.listen(stream);
  const clientID = agent.clientId;
  const user = req.user || '(Anonymous)';
  const remoteAddress = stream.remoteAddress;
  stream.on('close', function () {
    console.log(`ShareDB disconnected: ${clientID}, ${remoteAddress}, ${user}`);
    handleClientDisconnected(clientID, null, null);
  });
}

function tidyLooseConnections(callback) {
  console.log('Tidying loose connections...');
  handleClientDisconnected(null, null, null, function (err) {
    console.log('Finished');
    callback(err);
  });
}

function createDocument(id, callback) {
  const sharedbDoc = serverConnection.get('collection', id);
  sharedbDoc.fetch(function (err) {
    if (err) {
      return callback(err);
    }
    if (sharedbDoc.type) {
      return callback(new Error(503));
    }
    sharedbDoc.create(DEFAULT_DOCUMENT, err => {
      if (err) {
        return callback(err);
      }
      callback(null, DEFAULT_DOCUMENT)
    });
  });
}

module.exports = {
  tidyLooseConnections,
  handleSocketConnection,
  createDocument
};
