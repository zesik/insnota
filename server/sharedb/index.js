'use strict';

const sharedb = require('sharedb');
const sharedbDatabase = require('sharedb-mongo')('mongodb://localhost:27017/test');
const SocketStream = require('./socket-stream');

// Initialize ShareDB
const share = sharedb({ db: sharedbDatabase });
require('sharedb-logger')(share);
share.use('doc', handleDocRequest);
share.use('apply', handleApplyRequest);
share.use('commit', handleCommitRequest);

function handleSocketConnection(ws, req) {
  const stream = new SocketStream(ws, req);
  share.listen(stream);
}

function handleDocRequest(req, next) {
  return next();
}

function handleApplyRequest(req, next) {
  return next();
}

function handleCommitRequest(req, next) {
  return next();
}

module.exports = handleSocketConnection;
