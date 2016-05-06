'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Hashids = require('hashids');
const config = require('../config/app.config');
const userService = require('../services/user');
const documentService = require('../services/document');
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
  userService.findUser(req.params.email, function (err, user) {
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
  documentService.findByOwner(req.user.email, function (err, docs) {
    if (err) {
      return next(err);
    }
    res.send({
      name: req.user.name,
      email: req.user.email,
      documents: docs.map(doc => ({ id: doc._id, title: doc.title }))
    });
  });
});

router.post('/notes', function (req, res, next) {
  const id = hashids.encodeHex(mongoose.Types.ObjectId().toString());
  createDocument(id, function (err, doc) {
    documentService.create(id, req.user.email, doc.t, function (err) {
      if (err) {
        return next(err);
      }
      res.send({ id, title: doc.t });
    });
  })
});

module.exports = router;
