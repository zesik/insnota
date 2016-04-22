'use strict';

const express = require('express');
const router = express.Router();

router.use(function (req, res, next) {
  if (req.user) {
    return next();
  }
  return res.status(403).end();
});

router.get('/user', function (req, res, next) {
  res.send({ email: req.user.email });
});

router.get('/notes', function (req, res, next) {
  res.send([
    { documentID: 'document1', title: 'Document1' },
    { documentID: 'document2', title: 'Document2' },
    { documentID: 'document3', title: 'Document3' }
  ]);
});

module.exports = router;
