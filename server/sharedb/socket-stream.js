'use strict';

const Duplex = require('stream').Duplex;
const inherits = require('util').inherits;

function SocketStream(socket, req) {
  Duplex.call(this, { objectMode: true });

  this.socket = socket;
  this.headers = socket.upgradeReq.headers;
  this.remoteAddress = socket.upgradeReq.connection.remoteAddress;
  this.user = req.user;

  this.on('error', function (error) {
    console.warn('ShareDB client message stream error', error);
    socket.close('stopped');
  });

  // Readable stream is ended.
  this.on('end', function () {
    socket.close();
  });

  // The server ended the writable stream. Triggered by calling stream.end()
  // in agent.close()
  this.on('finish', function () {
    socket.close('stopped');
  });

  const self = this;
  socket.on('message', function (data) {
    self.push(data);
  });

  socket.on('close', function () {
    self.push(null);
    self.emit('close');
    self.emit('end');
    self.end();
  });
}
inherits(SocketStream, Duplex);

SocketStream.prototype.isServer = false;

SocketStream.prototype._read = function () {};

SocketStream.prototype._write = function (chunk, encoding, callback) {
  const socket = this.socket;
  process.nextTick(function () {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(chunk));
    }
    callback();
  });
};

module.exports = SocketStream;
