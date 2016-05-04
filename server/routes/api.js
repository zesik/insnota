'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Hashids = require('hashids');
const config = require('../config/app.config');
const User = require('../models/user');
const Document = require('../models/document');
const createDocument = require('../sharedb').createDocument;

const router = express.Router();
const hashids = new Hashids(config.hashidSalt);

router.use(function (req, res, next) {
  if (req.user || req.path === '/user' || req.path.startsWith('/users/')) {
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

router.get('/users/:email', function (req, res, next) {
  User.findOneByEmail(req.params.email, function (err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      res.send({ email: user.email, name: user.name });
    } else {
      res.status(404).end();
    }
  });
});

router.get('/notes', function (req, res, next) {
  Document.findByOwner(req.user.email, function (err, docs) {
    if (err) {
      return next(err);
    }
    res.send(docs.map(doc => ({ id: doc._id, title: doc.title })));
  });
});

router.post('/notes', function (req, res, next) {
  const id = hashids.encodeHex(mongoose.Types.ObjectId().toString());
  createDocument(id, function (err, doc) {
    const document = new Document();
    document._id = id;
    document.title = doc.t;
    document.owner = req.user.email;
    document.save(function (err) {
      if (err) {
        return next(err);
      }
      res.send({ id, title: document.title });
    });
  })
});

module.exports = router;
