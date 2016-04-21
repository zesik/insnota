'use strict';

const express = require('express');
const router = express.Router();

router.get('/notes', function (req, res, next) {
  res.send([
    { documentID: 'document1', title: 'Document1' },
    { documentID: 'document2', title: 'Document2' },
    { documentID: 'document3', title: 'Document3' }
  ]);
});

module.exports = router;
