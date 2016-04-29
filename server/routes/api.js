'use strict';

const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {
  if (req.user || req.path === '/user' || req.path === '/notes') {
    return next();
  }
  return res.status(403).end();
});

router.get('/user', function (req, res, next) {
  if (req.user) {
    res.send({ email: req.user.email });
  } else {
    res.send({});
  }
});

router.get('/notes', function (req, res, next) {
  res.send([
    { id: 'document1', title: 'Document1' },
    { id: 'document2', title: 'Document2' },
    { id: 'document3', title: 'Document3' }
  ]);
});

module.exports = router;
