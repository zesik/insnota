const async = require('async');
const config = require('../config');
const logger = require('../logger');
const sharedb = require('sharedb');
const sharedbDatabase = require('sharedb-mongo')(config.mongo);
const SocketStream = require('./socket-stream');
const ClientConnection = require('../models/clientConnection');
const Document = require('../models/document');

const ERROR_NOT_FOUND = '404';
const ERROR_ACCESS_DENIED = '404'; // Note: This value is set to '404' so that same value is passed to client side
const ERROR_SERVICE_UNAVAILABLE = '503';
const DEFAULT_DOCUMENT = {
  a: {},                // Collaborators
  t: 'Untitled',        // Title
  c: '',                // Content
  m: 'text/plain'       // MIME type
};

function handleClientSubscribing(clientID, user, collection, document, callback) {
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

function handleClientUnsubscribing(clientID, collection, document, callback) {
  const query = {};
  if (clientID) {
    query.client_id = clientID;
  }
  ClientConnection.find(query, function (err, docs) {
    if (err) {
      return callback(err);
    }
    async.map(docs, function (doc, callback) {
      async.mapSeries(doc.subscriptions, function (subscription, callback) {
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
            const clientInfo = sharedbDoc.data.a[doc.client_id];
            if (clientInfo) {
              sharedbDoc.submitOp({ p: ['a', doc.client_id], od: clientInfo });
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

function ensureReadPermission(documentID, user, next) {
  Document.findOne(documentID, function (err, doc) {
    if (err) {
      return next(err);
    }
    if (!doc) {
      return next(ERROR_NOT_FOUND);
    }
    if (doc.owner && doc.public_access !== 'view' && doc.public_access !== 'edit') {
      if (!user) {
        // Permission denied due to anonymous user trying to access private document
        return next(ERROR_ACCESS_DENIED);
      }
      if (!doc.owner.equals(user._id) &&
          !doc.viewable.find(id => id.equals(user._id)) &&
          !doc.editable.find(id => id.equals(user._id))) {
        // Permission denied due to non-collaborator trying to access the document
        return next(ERROR_ACCESS_DENIED);
      }
    }
    return next();
  });
}

function ensureWritePermission(documentID, user, next) {
  Document.findOne(documentID, function (err, doc) {
    if (err) {
      return next(err);
    }
    if (!doc) {
      return next(ERROR_NOT_FOUND);
    }
    if (doc.owner && doc.public_access !== 'edit') {
      if (!user) {
        // Permission denied due to anonymous user trying to edit private document
        return next(ERROR_ACCESS_DENIED);
      }
      if (!doc.owner.equals(user._id) && !doc.editable.find(id => id.equals(user._id))) {
        // Permission denied due to collaborator without editing permission trying to edit the document
        return next(ERROR_ACCESS_DENIED);
      }
    }
    return next();
  });
}

function handleShareDBReceive(req, next) {
  if (req.agent.stream.isServer) {
    return next();
  }
  switch (req.data.a) {
    case 's':
      ensureReadPermission(req.data.d, req.agent.stream.user, function (err) {
        if (err) {
          return next(err);
        }
        handleClientSubscribing(req.agent.clientId, req.agent.stream.user, req.data.c, req.data.d, next);
      });
      break;
    case 'u':
      handleClientUnsubscribing(req.agent.clientId, req.data.c, req.data.d, next);
      break;
    case 'op':
      ensureWritePermission(req.data.d, req.agent.stream.user, function (err) {
        if (err) {
          return next(err);
        }
        if (req.data.op) {
          for (let i = 0; i < req.data.op.length; ++i) {
            if (req.data.op[i].p[0] === 't') {
              const newTitle = req.data.op[i].oi;
              Document.update({ _id: req.data.d }, { title: newTitle }).exec();
            }
          }
        }
        return next();
      });
      break;
    default:
      return next(new Error(ERROR_ACCESS_DENIED));
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
    handleClientUnsubscribing(clientID, null, null);
  });
}

function tidyLooseConnections(callback) {
  logger.info('Tidying loose connections...');
  handleClientUnsubscribing(null, null, null, function (err) {
    logger.info('Finished tidying connections');
    callback(err);
  });
}

function createDocument(collection, document, callback) {
  const sharedbDoc = serverConnection.get(collection, document);
  sharedbDoc.fetch(function (err) {
    if (err) {
      return callback(err);
    }
    if (sharedbDoc.type) {
      // This means document with this ID already exists
      return callback(new Error(ERROR_SERVICE_UNAVAILABLE));
    }
    sharedbDoc.create(DEFAULT_DOCUMENT, err => {
      if (err) {
        return callback(err);
      }
      callback(null, DEFAULT_DOCUMENT);
    });
  });
}

function broadcastPermissionChange(collection, document, callback) {
  const sharedbDoc = serverConnection.get(collection, document);
  sharedbDoc.fetch(function (err) {
    if (err) {
      return callback(err);
    }
    if (typeof sharedbDoc.data.p !== 'undefined') {
      sharedbDoc.submitOp({ p: ['p'], na: 1 }, true);
    } else {
      sharedbDoc.submitOp({ p: ['p'], oi: 0 }, true);
    }
    callback();
  });
}

// Initialize ShareDB
const backend = sharedb({ db: sharedbDatabase });
require('sharedb-logger')(backend);
backend.use('connect', handleShareDBConnect);
backend.use('receive', handleShareDBReceive);
const serverConnection = backend.connect();

module.exports = {
  tidyLooseConnections,
  handleSocketConnection,
  createDocument,
  broadcastPermissionChange
};
