const express = require('express');
const config = require('../config');
const logger = require('../logger');
const recaptchaService = require('../services/recaptcha');
const User = require('../models/user');
const userService = require('../services/user');
const documentService = require('../services/document');
const sharedbService = require('../services/sharedb');

// eslint-disable-next-line new-cap
const router = express.Router();

function validateSignUpForm(req) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const recaptcha = req.body.recaptcha;
  const errors = {};
  if (!email || !email.trim().length) {
    errors.errorEmailEmpty = true;
  } else if (!/[^@]+@[^@]+/.test(email.trim())) {
    errors.errorEmailInvalid = true;
  }
  if (!name || !name.trim().length) {
    errors.errorNameEmpty = true;
  }
  if (!password) {
    errors.errorPasswordEmpty = true;
  } else if (password.length < 6) {
    errors.errorPasswordShort = true;
  }
  return { name, email, password, recaptcha, errors };
}

function validateSignInForm(req) {
  const email = req.body.email;
  const password = req.body.password;
  const remember = req.body.remember;
  const recaptcha = req.body.recaptcha;
  const errors = {};
  if (!email || !email.trim().length) {
    errors.errorEmailEmpty = true;
  } else if (!/[^@]+@[^@]+/.test(email.trim())) {
    errors.errorEmailInvalid = true;
  }
  if (!password) {
    errors.errorPasswordEmpty = true;
  }
  return { email, password, remember, recaptcha, errors };
}

function allValid(errors) {
  return Object.keys(errors).findIndex(key => errors[key]) === -1;
}

router.get('/users/:email', function (req, res, next) {
  userService.findUserByEmail(req.params.email)
    .then(user => res.send({ email: user.email, name: user.name }))
    .catch(err => {
      if (err) {
        next(err);
        return;
      }
      res.status(404).end();
    });
});

router.get('/profile', function (req, res, next) {
  if (!req.user) {
    res.status(403).end();
    return;
  }
  userService.findUser(req.user._id)
    .then(user => res.send({
      email: user.email,
      name: user.name,
      status: user.status,
      recaptcha: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
    }))
    .catch(err => {
      if (err) {
        next(err);
        return;
      }
      res.status(404).end();
    });
});

router.put('/settings/profile', function (req, res, next) {
  if (!req.user) {
    res.status(403).end();
    return;
  }
  const name = req.body.name.trim();
  if (!name.length) {
    res.status(422).send({ errorNameEmpty: true });
    return;
  }
  userService.updateName(req.user._id, req.body.name)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

router.put('/settings/password', function (req, res, next) {
  if (!req.user) {
    res.status(403).end();
    return;
  }
  if (!req.body.newPassword) {
    res.status(422).send({ errorNewPasswordEmpty: true });
    return;
  }
  if (req.body.newPassword.length < 6) {
    res.status(422).send({ errorNewPasswordShort: true });
    return;
  }
  userService.findUser(req.user._id).then(user => {
    recaptchaService.verifyPasswordAttempt(user.password_attempts, req.body.recaptcha).then(() => {
      userService.verifyPassword(user, req.body.oldPassword).then(() => {
        userService.updatePassword(req.user._id, req.body.newPassword)
          .then(() => res.status(204).end())
          .catch(err => next(err));
      }).catch(err => {   // userService.verifyPassword rejected
        if (err instanceof User) {
          res.status(422).send({
            errorCredentialInvalid: true,
            recaptchaSiteKey: recaptchaService.getPasswordAttemptSiteKey(err.password_attempts)
          });
          return;
        }
        next(err);
      });
    }).catch(err => {   // recaptchaService.verifyPasswordAttempt rejected
      if (err) {
        next(err);
        return;
      }
      res.status(422).send({
        errorRecaptchaInvalid: true,
        recaptchaSiteKey: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
      });
    });
  }).catch(err => {   // userService.findUser rejected
    if (err) {
      next(err);
      return;
    }
    res.status(404).end();
  });
});

router.get('/signup', function (req, res) {
  if (!config.allowSignUp) {
    res.status(403).end();
    return;
  }
  res.send({ recaptcha: recaptchaService.getSignUpSiteKey() });
});

router.post('/signup', function (req, res, next) {
  if (!config.allowSignUp) {
    res.status(403).send({ errorNotAllowed: true });
    return;
  }
  const form = validateSignUpForm(req);
  if (!allValid(form.errors)) {
    form.errors.recaptchaSiteKey = recaptchaService.getSignUpSiteKey();
    res.status(422).send(form.errors);
    return;
  }
  recaptchaService.verifySignUp(form.recaptcha).then(() => {
    userService.createUser(form.name, form.email, form.password).then(user => {
      req.session.userID = user._id;
      res.status(201).end();
    }).catch(err => {
      if (err) {
        next(err);
        return;
      }
      res.status(409).send({
        errorEmailOccupied: true,
        recaptchaSiteKey: recaptchaService.getSignUpSiteKey()
      });
    });
  }).catch(err => {
    if (err) {
      next(err);
      return;
    }
    res.status(422).send({
      errorRecaptchaInvalid: true,
      recaptchaSiteKey: recaptchaService.getSignUpSiteKey()
    });
  });
});

router.get('/signin/:email', function (req, res, next) {
  userService.findUserByEmail(req.params.email).then(user => res.send({
    email: user.email,
    name: user.name,
    recaptcha: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
  })).catch(err => {
    if (err) {
      next(err);
      return;
    }
    res.status(404).end();
  });
});

router.post('/signin', function (req, res, next) {
  const form = validateSignInForm(req);
  if (!allValid(form.errors)) {
    res.status(422).send(form.errors);
    return;
  }
  userService.findUserByEmail(form.email).then(user => {
    recaptchaService.verifyPasswordAttempt(user.password_attempts, form.recaptcha).then(() => {
      userService.verifyPassword(user, form.password).then(newUser => {
        if (form.remember) {
          userService.issueLoginToken(newUser._id).then(token => {
            req.session.userID = newUser._id;
            res.cookie(config.loginTokenName, token._id, {
              expires: token.expires,
              signed: true
            });
            res.status(204).end();
          }).catch(err => next(err));
          return;
        }
        req.session.userID = newUser._id;
        res.status(204).end();
      }).catch(err => {   // userService.verifyPassword rejected
        if (err instanceof User) {
          res.status(422).send({
            errorCredentialInvalid: true,
            recaptchaSiteKey: recaptchaService.getPasswordAttemptSiteKey(err.password_attempts)
          });
          return;
        }
        next(err);
      });
    }).catch(err => {   // recaptchaService.verifyPasswordAttempt rejected
      if (err) {
        next(err);
        return;
      }
      res.status(422).send({
        errorRecaptchaInvalid: true,
        recaptchaSiteKey: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
      });
    });
  }).catch(err => {   // userService.findUserByEmail rejected
    if (err) {
      next(err);
      return;
    }
    res.status(422).send({ errorEmailNotExist: true });
  });
});

router.post('/signout', function (req, res) {
  delete req.session.userID;
  res.clearCookie(config.loginTokenName, {});
  res.status(204).end();
});

router.get('/notes', function (req, res, next) {
  if (!req.user) {
    res.send({});
    return;
  }
  documentService.findByOwner(req.user._id).then(docs => res.send({
    name: req.user.name,
    email: req.user.email,
    documents: docs.map(doc => ({ id: doc._id, title: doc.title }))
  })).catch(err => next(err));
});

router.post('/notes', function (req, res, next) {
  if (!config.anonymousCreating && !req.user) {
    res.status(403).end();
    return;
  }
  const userID = req.user ? req.user._id : null;
  sharedbService.createDocument(config.documentCollection).then(doc => {
    documentService.create(doc.id, doc.collection, userID, doc.title)
      .then(() => res.send({ id: doc.id, title: doc.t }))
      .catch(e => next(e));
  }).catch(err => next(err));
});

router.get('/notes/:docID', function (req, res, next) {
  documentService.find(req.params.docID).then(doc => {
    // Populate basic document information
    const docInfo = {
      collection: doc.owner_collection || config.documentCollection,
      document: doc._id,
      owner: {},
      collaborators: [],
      editorInviting: !!doc.editor_inviting
    };
    if (doc.public_access === 'edit') {
      docInfo.anonymousEditing = 'edit';
    } else if (doc.public_access === 'view') {
      docInfo.anonymousEditing = 'view';
    } else {
      docInfo.anonymousEditing = 'deny';
    }

    // Gather user IDs with access permission
    const ids = [];
    if (doc.owner) {
      ids.push(doc.owner);
    }
    Array.prototype.push.apply(ids, doc.viewable);
    Array.prototype.push.apply(ids, doc.editable);

    // Check whether user can access this document
    if (docInfo.anonymousEditing === 'deny' && (!req.user || !ids.find(id => id.equals(req.user._id)))) {
      res.status(404).end();
      return;
    }

    userService.findUsers(ids).then(users => {
      // Populate collaborators
      const userMap = users.reduce((map, user) => { map[user._id] = user; return map; }, {});
      if (typeof userMap[doc.owner] !== 'undefined') {
        docInfo.owner = { email: userMap[doc.owner].email, name: userMap[doc.owner].name };
      }
      doc.viewable.forEach(id => {
        if (typeof userMap[id] !== 'undefined') {
          docInfo.collaborators.push({ email: userMap[id].email, name: userMap[id].name, permission: 'view' });
        }
      });
      doc.editable.forEach(id => {
        if (typeof userMap[id] !== 'undefined') {
          docInfo.collaborators.push({ email: userMap[id].email, name: userMap[id].name, permission: 'edit' });
        }
      });
      docInfo.collaborators.sort((a, b) => a.email.toLowerCase().localeCompare(b.email.toLowerCase()));

      // Send result
      res.send(docInfo);
    }).catch(err => next(err));
  }).catch(err => {
    if (err) {
      next(err);
      return;
    }
    res.status(404).end();
  });
});

router.put('/notes/:docID', function (req, res, next) {
  if (!req.user) {
    res.status(404).end();
    return;
  }
  documentService.find(req.params.docID).then(doc => {
    if (!doc.owner) {
      res.status(403).end();
      return;
    }

    // Check whether user is allowed to modify document sharing settings
    if (!doc.owner.equals(req.user._id) &&
        (!doc.editor_inviting || !doc.editable.find(id => id.equals(req.user._id)))) {
      res.status(404).end();
      return;
    }

    // Populate collaborators
    const collaborators = {};
    req.body.collaborators.forEach(item => {
      collaborators[item.email] = item.permission;
    });
    userService.findUsersByEmails(Object.keys(collaborators)).then(users => {
      const editable = [];
      const viewable = [];
      users.forEach(user => {
        if (collaborators[user.email] === 'edit') {
          editable.push(user._id);
        } else {
          viewable.push(user._id);
        }
      });
      doc.viewable = viewable;
      doc.editable = editable;

      // Only owner can modify certain settings
      if (doc.owner === req.user.email) {
        doc.public_access = req.body.anonymousEditing;
        doc.editor_inviting = !!req.body.editorInviting;
      }

      doc.save().then(() => {
        const collection = doc.owner_collection;
        sharedbService.broadcastPermissionChange(collection, doc._id)
          .then(() => res.status(204).end())
          .catch(err => next(err));
      }).catch(err => {
        logger.error('Database error while saving document permission');
        next(err);
      });
    }).catch(err => next(err));
  }).catch(err => {
    if (err) {
      next(err);
      return;
    }
    res.status(404).end();
  });
});

router.delete('/notes/:docID', function (req, res, next) {
  if (!req.user) {
    res.status(404).end();
    return;
  }
  documentService.find(req.params.docID).then(doc => {
    if (!doc.owner) {
      res.status(404).end();
      return;
    }

    // Check whether user is allowed to modify document sharing settings
    if (!doc.owner.equals(req.user._id)) {
      res.status(404).end();
      return;
    }

    // Mark document deleted
    doc.deleted_at = new Date();

    doc.save(() => {
      const collection = doc.owner_collection;
      sharedbService.broadcastPermissionChange(collection, doc._id)
        .then(() => res.status(204).end())
        .catch(err => next(err));
    }).catch(err => {
      logger.error('Database error while saving document permission');
      next(err);
    });
  }).catch(err => {
    if (err) {
      next(err);
      return;
    }
    res.status(404).end();
  });
});

module.exports = router;
