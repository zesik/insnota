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

router.get('/profile', function (req, res) {
  if (req.user) {
    userService.findUser(req.user.email, function (err, user) {
      if (err) {
        return next(err);
      }
      if (user) {
        res.send({
          email: user.email,
          name: user.name,
          status: user.status
        });
      } else {
        res.send({});
      }
    });
  } else {
    res.send({});
  }
});

router.put('/profile', function (req, res) {
  if (!req.user) {
    return res.status(403).end();
  }
  const name = req.body.name.trim();
  if (!name.length) {
    return res.status(400).send({ errorNameEmpty: true });
  }
  userService.updateName(req.user.email, req.body.name, function (err) {
    if (err) {
      return next(err);
    }
    return res.status(200).end();
  });
});

router.get('/signup', function (req, res, next) {
  if (!config.allowSignUp) {
    return res.status(403).end();
  }
  const siteKey = recaptchaService.shouldCheckSignUp() ? recaptchaService.getSignUpSiteKey() : null;
  res.send({ recaptcha: siteKey });
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
  if (!req.user) {
    return res.send({});
  }
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
  // TODO: check if we need to support anonymous creating
  if (!req.user) {
    return res.status(403).end();
  }
  const id = hashids.encodeHex(mongoose.Types.ObjectId().toString());
  createDocument(id, function (err, doc) {
    documentService.create(id, req.user.email, doc.t, function (err) {
      if (err) {
        return next(err);
      }
      res.send({ id, title: doc.t });
    });
  });
});

router.get('/notes/:docID', function (req, res, next) {
  documentService.findByID(req.params.docID, function (err, doc) {
    if (err) {
      return next(err);
    }

    if (!doc) {
      return res.status(404).end();
    }

    // Populate basic document information
    const docInfo = {
      collection: doc.owner_collection || config.documentCollection,
      document: doc._id,
      owner: { email: doc.owner },
      collaborators: []
    };
    if (doc.public_access === 'edit') {
      docInfo.anonymousEditing = 'edit';
    } else if (doc.public_access === 'view') {
      docInfo.anonymousEditing = 'view';
    } else {
      docInfo.anonymousEditing = 'deny';
    }
    const emails = [doc.owner];
    Array.prototype.push.apply(emails, doc.viewable);
    Array.prototype.push.apply(emails, doc.editable);
    docInfo.editorInviting = !!doc.editor_inviting;

    // Check whether user can access this document
    if (docInfo.anonymousEditing === 'deny' && (!req.user || !emails.includes(req.user.email))) {
      return res.status(404).end();
    }

    userService.findUsersIn(emails, function (err, users) {
      if (err) {
        return next(err);
      }

      // Populate collaborators
      const userMap = users.reduce((map, item) => {
        map[item.email] = item;
        return map;
      }, {});
      if (typeof userMap[doc.owner] !== 'undefined') {
        docInfo.owner = { email: doc.owner, name: userMap[doc.owner].name };
      }
      const collaborators = {};
      doc.viewable.forEach(item => {
        if (typeof userMap[item] !== 'undefined') {
          collaborators[item] = { email: item, name: userMap[item].name, permission: 'view' };
        }
      });
      doc.editable.forEach(item => {
        if (typeof userMap[item] !== 'undefined') {
          collaborators[item] = { email: item, name: userMap[item].name, permission: 'edit' };
        }
      });
      Object.keys(collaborators).forEach(email => docInfo.collaborators.push(collaborators[email]));
      docInfo.collaborators.sort((a, b) => a.email.toLowerCase().localeCompare(b.email.toLowerCase()));

      res.send(docInfo);
    });
  });
});

router.put('/notes/:docID', function (req, res, next) {
  if (!req.user) {
    return res.status(404).end();
  }
  documentService.findByID(req.params.docID, function (err, doc) {
    if (err) {
      return next(err);
    }

    if (!doc) {
      return res.status(404).end();
    }

    // Check whether user is allowed to modify document sharing settings
    if (doc.owner !== req.user.email && (!doc.editor_inviting || !doc.editable.includes(req.user.email))) {
      return res.status(404).end();
    }

    // Populate collaborators
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

    // Only owner can modify certain settings
    if (doc.owner === req.user.email) {
      doc.public_access = req.body.anonymousEditing;
      doc.editor_inviting = !!req.body.editorInviting;
    }

    doc.save(function (err) {
      if (err) {
        return next(err);
      }
      const collection = doc.owner_collection || config.documentCollection;
      broadcastPermissionChange(collection, doc._id, function (err) {
        if (err) {
          return next(err);
        }
        res.status(204).end();
      });
    });
  });
});

router.delete('/notes/:docID', function (req, res, next) {
  if (!req.user) {
    return res.status(404).end();
  }
  documentService.findByID(req.params.docID, function (err, doc) {
    if (err) {
      return next(err);
    }

    if (!doc) {
      return res.status(404).end();
    }

    // Check whether user is allowed to modify document sharing settings
    if (doc.owner !== req.user.email) {
      return res.status(404).end();
    }

    // Mark document deleted
    doc.deleted_at = new Date();

    doc.save(function (err) {
      if (err) {
        return next(err);
      }
      const collection = doc.owner_collection || config.documentCollection;
      broadcastPermissionChange(collection, doc._id, function (err) {
        if (err) {
          return next(err);
        }
        res.status(204).end();
      });
    });
  });
});

module.exports = router;
