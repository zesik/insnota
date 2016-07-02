const async = require('async');
const mongoose = require('mongoose');
const Hashids = require('hashids');
const sharedb = require('sharedb');
const config = require('../config');
const sharedbDatabase = require('sharedb-mongo')(config.mongo);
const sharedbLogger = require('sharedb-logger');
const logger = require('../logger');
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

const hashids = new Hashids(config.hashidSalt);
let backend = null;
let serverConnection = null;

function generateDocumentID() {
  return hashids.encodeHex((new mongoose.Types.ObjectId()).toString());
}

function handleClientSubscribing(clientID, user, collection, document) {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    ClientConnection.findOne({ client_id: clientID }, (errFind, clientConnection) => {
      if (errFind) {
        logger.error('Database error when finding client connection');
        reject(errFind);
        return;
      }
      // Append current connection to the active connection list
      if (!clientConnection) {
        clientConnection = new ClientConnection();
        clientConnection.client_id = clientID;
        clientConnection.subscriptions = [];
      }
      clientConnection.subscriptions.push({ c: collection, d: document, t: timestamp });
      clientConnection.save(errSave => {
        if (errSave) {
          logger.error('Database error when saving client connection');
          reject(errSave);
          return;
        }
        // Append current connection to the document itself
        const sharedbDoc = serverConnection.get(collection, document);
        sharedbDoc.fetch(errFetch => {
          if (errFetch) {
            logger.error('Error when fetching document');
            reject(errFetch);
            return;
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
          resolve();
        });
      });
    });
  });
}

function handleClientUnsubscribing(clientID, collection, document) {
  return new Promise((resolve, reject) => {
    const query = {};
    if (clientID) {
      query.client_id = clientID;
    }
    ClientConnection.find(query, (errFind, connections) => {
      if (errFind) {
        logger.error('Database error when finding client connections');
        reject(errFind);
        return;
      }
      async.map(connections, (connection, callback) => {
        async.mapSeries(connection.subscriptions, (subscription, connectionCallback) => {
          if ((!collection || collection === subscription.c) && (!document || document === subscription.d)) {
            const sharedbDoc = serverConnection.get(subscription.c, subscription.d);
            sharedbDoc.fetch(err => {
              if (err) {
                logger.error('Error when fetching document');
                connectionCallback(err);
                return;
              }
              if (!sharedbDoc.type) {
                // Document does not exist any more.
                connectionCallback();
                return;
              }
              if (sharedbDoc.data.a) {
                const clientInfo = sharedbDoc.data.a[connection.client_id];
                if (clientInfo) {
                  sharedbDoc.submitOp({ p: ['a', connection.client_id], od: clientInfo });
                }
              }
              connectionCallback();
            });
          } else {
            connectionCallback();
          }
        }, err => callback(err));
      }, err => {
        if (err) {
          reject(err);
          return;
        }
        ClientConnection.purgeSubscriptions(clientID, collection, document, errPurge => {
          if (errPurge) {
            logger.error('Database error when purging subscriptions');
            reject(errPurge);
            return;
          }
          resolve();
        });
      });
    });
  });
}

/**
 * @note reject() argument types: Error object or string (when access error occurred)
 */
function ensureReadPermission(documentID, user) {
  return new Promise((resolve, reject) => {
    Document.findOne(documentID, function (err, doc) {
      if (err) {
        logger.error('Database error when checking read permission');
        reject(err);
        return;
      }
      if (!doc) {
        reject(ERROR_NOT_FOUND);
        return;
      }
      if (doc.owner && doc.public_access !== 'view' && doc.public_access !== 'edit') {
        if (!user) {
          // Permission denied due to anonymous user trying to access private document
          reject(ERROR_ACCESS_DENIED);
          return;
        }
        if (!doc.owner.equals(user._id) &&
            !doc.viewable.find(id => id.equals(user._id)) &&
            !doc.editable.find(id => id.equals(user._id))) {
          // Permission denied due to non-collaborator trying to access the document
          reject(ERROR_ACCESS_DENIED);
          return;
        }
      }
      resolve();
    });
  });
}

/**
 * @note reject() argument types: Error object or string (when access error occurred)
 */
function ensureWritePermission(documentID, user) {
  return new Promise((resolve, reject) => {
    Document.findOne(documentID, function (err, doc) {
      if (err) {
        logger.error('Database error when checking write permission');
        reject(err);
        return;
      }
      if (!doc) {
        reject(ERROR_NOT_FOUND);
        return;
      }
      if (doc.owner && doc.public_access !== 'edit') {
        if (!user) {
          // Permission denied due to anonymous user trying to edit private document
          reject(ERROR_ACCESS_DENIED);
          return;
        }
        if (!doc.owner.equals(user._id) && !doc.editable.find(id => id.equals(user._id))) {
          // Permission denied due to collaborator without editing permission trying to edit the document
          reject(ERROR_ACCESS_DENIED);
          return;
        }
      }
      resolve();
    });
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
      ensureReadPermission(req.data.d, req.agent.stream.user).then(() => {
        handleClientSubscribing(req.agent.clientId, req.agent.stream.user, req.data.c, req.data.d)
          .then(() => next())
          .catch(err => next(err));
      }).catch(err => next(err));
      break;
    case 'u':
      handleClientUnsubscribing(req.agent.clientId, req.data.c, req.data.d)
        .then(() => next())
        .catch(err => next(err));
      break;
    case 'op':
      ensureWritePermission(req.data.d, req.agent.stream.user).then(() => {
        if (req.data.op) {
          for (let i = 0; i < req.data.op.length; ++i) {
            if (req.data.op[i].p[0] === 't') {
              const newTitle = req.data.op[i].oi;
              Document.update({ _id: req.data.d }, { title: newTitle }).exec();
            }
          }
        }
        next();
      }).catch(err => next(err));
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
    handleClientUnsubscribing(clientID, null, null);
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
