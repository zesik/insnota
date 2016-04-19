const http = require('http');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const apis = require('./routes/api');

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
app.use('/', routes);
app.use('/api', apis);

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

// Initialize WebSocket
require('./websocket/index')(server);

// Listen
const port = 3000;
server.listen(port, function () {
  console.log(`Listening on ${port}`);
});
