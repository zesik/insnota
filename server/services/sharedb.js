const mongoose = require('mongoose');
const Hashids = require('hashids');
const sharedb = require('sharedb');
const config = require('../config');
const sharedbDatabase = require('sharedb-mongo')(config.MONGO_URI);
const sharedbLogger = require('sharedb-logger');
const logger = require('../logger');
const SocketStream = require('./socket-stream');
const ClientConnection = require('../models/clientConnection');
const Document = require('../models/document');

const ERROR_NOT_FOUND = '404';
const ERROR_ACCESS_DENIED = '403';
const ERROR_SERVICE_UNAVAILABLE = '503';
const DEFAULT_DOCUMENT = {
  a: {},                                // Collaborators
  t: config.DOCUMENT_DEFAULT_TITLE,     // Title
  c: config.DOCUMENT_DEFAULT_CONTENT,   // Content
  m: config.DOCUMENT_DEFAULT_MIME       // MIME type
};

const hashids = new Hashids(config.HASH_ID_SALT);
let backend = null;
let serverConnection = null;

function generateDocumentID() {
  return hashids.encodeHex((new mongoose.Types.ObjectId()).toString());
}

function handleClientSubscribing(clientID, user, collection, document) {
  const timestamp = Date.now();
  return Promise.resolve()
    .then(() => ClientConnection.findOne({ client_id: clientID }))
    // Append current connection to the active connection list
    .then(connection => {
      if (!connection) {
        connection = new ClientConnection();
        connection.client_id = clientID;
        connection.subscriptions = [];
      }
      connection.subscriptions.push({ c: collection, d: document, t: timestamp });
      return connection.save();
    })
    // Append current connection to the document itself
    .then(() => new Promise((resolve, reject) => {
      const sharedbDoc = serverConnection.get(collection, document);
      sharedbDoc.fetch(err => {
        if (err) {
          return reject(err);
        }
        return resolve(sharedbDoc);
      });
    }))
    .then(sharedbDoc => {
      if (!sharedbDoc.data.a) {
        sharedbDoc.submitOp({ p: ['a'], oi: {} }, true);
      }
      const clientInfo = { t: timestamp, c: [] };
      if (user) {
        clientInfo.e = user.email;
        clientInfo.n = user.name;
      }
      sharedbDoc.submitOp({ p: ['a', clientID], oi: clientInfo }, true);
    });
}

function handleClientUnsubscribing(clientID, collection, document) {
  const query = {};
  if (clientID) {
    query.client_id = clientID;
  }
  return Promise.resolve()
    .then(() => ClientConnection.find(query))
    .then(connections => {
      const promises = [];
      connections.forEach(connection => {
        promises.push(...connection.subscriptions
          .filter(subscription =>
            (!collection || collection === subscription.c) && (!document || document === subscription.d))
          .map(subscription => Promise.resolve()
            .then(() => new Promise((resolve, reject) => {
              const sharedbDoc = serverConnection.get(subscription.c, subscription.d);
              sharedbDoc.fetch(err => {
                if (err) {
                  return reject(err);
                }
                return resolve(sharedbDoc);
              });
            }))
            .then(sharedbDoc => {
              if (!sharedbDoc.type) {
                // Document does not exist any more.
                return;
              }
              if (sharedbDoc.data.a) {
                const clientInfo = sharedbDoc.data.a[connection.client_id];
                if (clientInfo) {
                  sharedbDoc.submitOp({ p: ['a', connection.client_id], od: clientInfo });
                }
              }
            })));
      });
      return Promise.all(promises);
    })
    .then(() => ClientConnection.purgeSubscriptions(clientID, collection, document));
}

function ensureReadPermission(documentID, user) {
  return Promise.resolve()
    .then(() => Document.findOne({ _id: documentID }))
    .then(doc => {
      if (!doc) {
        throw new Error(ERROR_NOT_FOUND);
      }
      if (doc.owner && doc.public_access !== 'view' && doc.public_access !== 'edit') {
        if (!user) {
          // Permission denied due to anonymous user trying to access private document
          throw new Error(ERROR_ACCESS_DENIED);
        }
        if (!doc.owner.equals(user._id) &&
            !doc.viewable.find(id => id.equals(user._id)) &&
            !doc.editable.find(id => id.equals(user._id))) {
          // Permission denied due to non-collaborator trying to access the document
          throw new Error(ERROR_ACCESS_DENIED);
        }
      }
    });
}

function ensureWritePermission(documentID, user) {
  return Promise.resolve()
    .then(() => Document.findOne({ _id: documentID }))
    .then(doc => {
      if (!doc) {
        throw new Error(ERROR_NOT_FOUND);
      }
      if (doc.owner && doc.public_access !== 'edit') {
        if (!user) {
          // Permission denied due to anonymous user trying to edit private document
          throw new Error(ERROR_ACCESS_DENIED);
        }
        if (!doc.owner.equals(user._id) && !doc.editable.find(id => id.equals(user._id))) {
          // Permission denied due to collaborator without editing permission trying to edit the document
          throw new Error(ERROR_ACCESS_DENIED);
        }
      }
    });
}

function handleShareDBConnect(req, next) {
  const clientID = req.agent.clientId;
  if (req.stream.isServer) {
    logger.debug(`ShareDB connected: ${clientID}, (Server)`);
  } else {
    const user = req.stream.user ? req.stream.user.email : '(Anonymous)';
    const remoteAddress = req.stream.remoteAddress;
    logger.debug(`ShareDB connected: ${clientID}, ${remoteAddress}, ${user}`);
  }
  return next();
}

function handleShareDBReceive(req, next) {
  if (req.agent.stream.isServer) {
    next();
    return;
  }
  switch (req.data.a) {
    case 's':
      ensureReadPermission(req.data.d, req.agent.stream.user)
        .then(() => handleClientSubscribing(req.agent.clientId, req.agent.stream.user, req.data.c, req.data.d))
        .then(() => next())
        .catch(err => next(err));
      break;
    case 'u':
      handleClientUnsubscribing(req.agent.clientId, req.data.c, req.data.d)
        .then(() => next())
        .catch(err => next(err));
      break;
    case 'op':
      ensureWritePermission(req.data.d, req.agent.stream.user)
        .then(() => {
          if (req.data.op) {
            for (let i = 0; i < req.data.op.length; ++i) {
              if (req.data.op[i].p[0] === 't') {
                const newTitle = req.data.op[i].oi;
                Document.update({ _id: req.data.d }, { title: newTitle }).exec();
              }
            }
          }
          next();
        })
        .catch(err => next(err));
      break;
    default:
      next(new Error(ERROR_ACCESS_DENIED));
      return;
  }
}

function initialize() {
  backend = sharedb({ db: sharedbDatabase });
  sharedbLogger(backend);
  backend.use('connect', handleShareDBConnect);
  backend.use('receive', handleShareDBReceive);
  serverConnection = backend.connect();
  logger.info('Tidying loose connections...');
  return handleClientUnsubscribing();
}

function handleSocketConnection(ws, req) {
  const stream = new SocketStream(ws, req);
  const agent = backend.listen(stream);
  const clientID = agent.clientId;
  const user = req.user || '(Anonymous)';
  const remoteAddress = stream.remoteAddress;
  stream.on('close', function () {
    logger.debug(`ShareDB disconnected: ${clientID}, ${remoteAddress}, ${user}`);
    handleClientUnsubscribing(clientID);
  });
}

function createDocument(collection) {
  return new Promise((resolve, reject) => {
    const documentID = generateDocumentID();
    const sharedbDoc = serverConnection.get(collection, documentID);
    sharedbDoc.fetch(errFetch => {
      if (errFetch) {
        reject(errFetch);
        return;
      }
      if (sharedbDoc.type) {
        // This means document with this ID already exists
        reject(new Error(ERROR_SERVICE_UNAVAILABLE));
        return;
      }
      sharedbDoc.create(DEFAULT_DOCUMENT, errCreate => {
        if (errCreate) {
          reject(errCreate);
          return;
        }
        resolve({ collection, id: documentID, title: DEFAULT_DOCUMENT.t });
      });
    });
  });
}

function broadcastPermissionChange(collection, document) {
  return new Promise((resolve, reject) => {
    const sharedbDoc = serverConnection.get(collection, document);
    sharedbDoc.fetch(err => {
      if (err) {
        reject(err);
        return;
      }
      if (typeof sharedbDoc.data.p !== 'undefined') {
        sharedbDoc.submitOp({ p: ['p'], na: 1 }, true);
      } else {
        sharedbDoc.submitOp({ p: ['p'], oi: 0 }, true);
      }
      resolve();
    });
  });
}

module.exports = {
  initialize,
  handleSocketConnection,
  createDocument,
  broadcastPermissionChange
};
