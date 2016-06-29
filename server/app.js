const http = require('http');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const userService = require('./services/user');
const config = require('./config');
const logger = require('./logger');

// Initialize express
const app = express();
// Enable web socket on the application
require('express-ws')(app);

// Initialize database
require('./models/database')(function (err) {
  if (err) {
    console.error(err);
    return;
  }
  // Initialize ShareDB
  require('./sharedb').tidyLooseConnections(function (err) {
    if (err) {
      console.error(err);
      return;
    }
    initializeExpress();
  });
});

function initializeExpress() {
  // Express routes. This must be called after enabling web socket
  const routes = require('./routes/index');
  const apis = require('./routes/api');

  // Set up view engine
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // Set up middleware
  app.use(express.static(path.join(__dirname, '..', 'build')));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser(config.cookieSecret));
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));

  // Deserialize user from session
  app.use(function (req, res, next) {
    // First try to check from session
    if (req.session.userID) {
      userService.findUser(req.session.userID).then(user => {
        req.user = user;
        next();
      }).catch(err => next(err));
      return;
    }
    // Check whether the user has login token
    if (!req.upgrade && req.signedCookies[config.loginTokenName]) {
      userService.verifyLoginToken(req.signedCookies[config.loginTokenName]).then(userID => {
        res.clearCookie(config.loginTokenName, {});
        userService.findUser(userID).then(user => {
          userService.issueLoginToken(user._id).then(token => {
            req.session.userID = user._id;
            req.user = user;
            res.cookie(config.loginTokenName, token._id, {
              expires: token.expires,
              signed: true
            });
            return next();
          }).catch(err => next(err));
        }).catch(err => next(err));
      }).catch(err => next(err));
    }
    return next();
  });

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
    logger.error(err);
    res.status(err.status || 500);
    res.render('error', {
      title: err.message,
      message: err.message,
      error: {}
    });
  });

  // Listen
  const port = 3000;
  app.listen(port, function () {
    logger.info(`Listening on ${port}`);
  });
}
