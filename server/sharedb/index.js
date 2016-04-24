'use strict';

const sharedb = require('sharedb');
const sharedbDatabase = require('sharedb-mongo')('mongodb://localhost:27017/test');
const SocketStream = require('./socket-stream');

// Initialize ShareDB
const share = sharedb({ db: sharedbDatabase });
require('sharedb-logger')(share);
share.use('connect', handleConnect);
share.use('doc', handleDoc);
share.use('commit', handleCommit);

function handleSocketConnection(ws, req) {
  const stream = new SocketStream(ws, req);
  share.listen(stream);
}

function handleConnect(req, next) {
  const clientID = req.agent.clientId;
  const user = req.stream.user || '(Anonymous)';
  const remoteAddress = req.stream.remoteAddress;
  console.log(`Client connected: ${remoteAddress}, ${clientID}, ${user}`);
  return next();
}

function handleDoc(req, next) {
  return next();
}

function handleCommit(req, next) {
  return next();
}

module.exports = handleSocketConnection;
