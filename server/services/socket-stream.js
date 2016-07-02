const Duplex = require('stream').Duplex;
const inherits = require('util').inherits;

function SocketStream(socket, req) {
  Duplex.call(this, { objectMode: true });

  this.socket = socket;
  this.headers = socket.upgradeReq.headers;
  this.remoteAddress = socket.upgradeReq.connection.remoteAddress;
  this.user = req.user;

  this.on('error', () => socket.close());
  this.on('end', () => socket.close());

  const self = this;
  socket.on('message', data => self.push(data));
  socket.on('close', function () {
    self.push(null);
    self.end();

    self.emit('close');
    self.emit('end');
  });
}
inherits(SocketStream, Duplex);

SocketStream.prototype.isServer = false;

SocketStream.prototype._read = function () {};

SocketStream.prototype._write = function (chunk, encoding, callback) {
  const socket = this.socket;
  if (socket.readyState === 1) {
    this.socket.send(JSON.stringify(chunk));
  }
  callback();
};

module.exports = SocketStream;
