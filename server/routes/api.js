'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Hashids = require('hashids');
const config = require('../config');
const userService = require('../services/user');
const documentService = require('../services/document');
const recaptchaService = require('../services/recaptcha');
const createDocument = require('../sharedb').createDocument;
const broadcastPermissionChange = require('../sharedb').broadcastPermissionChange;

const router = express.Router();
const hashids = new Hashids(config.hashidSalt);

router.use(function (req, res, next) {
  if (req.user || req.path === '/user' || req.path === '/signup' || req.path.startsWith('/signin/') ||
      req.path.startsWith('/notes/')) {
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
  })
});

router.get('/signup', function (req, res, next) {
  if (!config.allowSignUp) {
    res.status(403).end();
    return;
  }
  if (recaptchaService.shouldCheckSignUp()) {
    res.send({ recaptcha: recaptchaService.getSignUpSiteKey() });
  } else {
    res.send({});
  }
});

router.get('/signin/:email', function (req, res, next) {
  userService.findUser(req.params.email, function (err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      const siteKey = recaptchaService.shouldCheckSignIn(user.login_attempts) ?
        recaptchaService.getSignInSiteKey() : null;
      res.send({ email: user.email, name: user.name, recaptcha: siteKey });
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

router.get('/notes/:docID', function (req, res, next) {
  documentService.findByID(req.params.docID, function (err, doc) {
    if (err) {
      return next(err);
    }
    if (!doc) {
      return res.send(404).end();
    }
    const permission = {
      owner: { email: doc.owner },
      collaborators: []
    };
    if (doc.public_access === 'edit') {
      permission.anonymousEditing = 'edit';
    } else if (doc.public_access === 'view') {
      permission.anonymousEditing = 'view';
    } else {
      permission.anonymousEditing = 'deny';
    }
    permission.editorInviting = !!doc.editor_inviting;
    const emails = [doc.owner];
    Array.prototype.push.apply(emails, doc.viewable);
    Array.prototype.push.apply(emails, doc.editable);
    userService.findUsersIn(emails, function (err, users) {
      if (err) {
        return next(err);
      }
      const userMap = users.reduce(function (map, item) {
        map[item.email] = item;
        return map;
      }, {});
      if (typeof userMap[doc.owner] !== 'undefined') {
        permission.owner = { email: doc.owner, name: userMap[doc.owner].name };
      }
      const collaborators = {};
      doc.viewable.forEach(function (item) {
        if (typeof userMap[item] !== 'undefined') {
          collaborators[item] = { email: item, name: userMap[item].name, permission: 'view' };
        }
      });
      doc.editable.forEach(function (item) {
        if (typeof userMap[item] !== 'undefined') {
          collaborators[item] = { email: item, name: userMap[item].name, permission: 'edit' };
        }
      });
      for (const email in collaborators) {
        if (collaborators.hasOwnProperty(email)) {
          permission.collaborators.push(collaborators[email]);
        }
      }
      permission.collaborators.sort((a, b) => a.email.toLowerCase().localeCompare(b.email.toLowerCase()));
      res.send(permission);
    });
  });
});

router.put('/notes/:docID', function (req, res, next) {
  documentService.findByID(req.params.docID, function (err, doc) {
    if (err) {
      return next(err);
    }
    if (!doc) {
      return res.send(404).end();
    }
    const editable = [];
    const viewable = [];
    req.body.collaborators.forEach(item => {
      if (item.permission === 'edit') {
        editable.push(item.email);
      } else {
        viewable.push(item.email);
      }
    });
    doc.viewable = viewable;
    doc.editable = editable;
    doc.public_access = req.body.anonymousEditing;
    doc.editor_inviting = !!req.body.editorInviting;
    doc.save(function (err) {
      if (err) {
        return next(err);
      }
      broadcastPermissionChange('collection', doc._id, function (err) {
        if (err) {
          return next(err);
        }
        res.status(200).end();
      });
    });
  });
});

router.get('/users/:email', function (req, res, next) {
  userService.findUser(req.params.email, function (err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      res.send({ email: user.email, name: user.name });
    } else {
      res.send(404).end();
    }
  });
});

module.exports = router;
