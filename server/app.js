const http = require('http');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const websocket = require('ws');
const sharedb = require('sharedb');
const sharedbDatabase = require('sharedb-mongo')('mongodb://localhost:27017/test');
const ServerStream = require('./server-stream');

// Initialize express
const app = express();

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'build')));

// Set up routers
app.get('/', function (req, res, next) {
  res.render('index');
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler: will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      title: err.message,
      message: err.message,
      error: err
    });
  });
}

// Production error handler: no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    title: err.message,
    message: err.message,
    error: {}
  });
});

// Create express server
const server = http.createServer(app);

// Initialize ShareDB
const share = sharedb({db: sharedbDatabase});

require('sharedb-logger')(share);
require('sharedb-access')(share);

// Initialize web socket
const wss = new websocket.Server({ server });

wss.on('connection', function (ws, req) {
  const stream = new ServerStream(ws);
  share.listen(stream);
});

// Listen
const port = 3000;
server.listen(port, function () {
  console.log(`Listening on ${port}`);
});
