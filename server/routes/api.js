const express = require('express');
const config = require('../config');
const { ClientError, ClientErrorCode } = require('../error');
const recaptchaService = require('../services/recaptcha');
const userService = require('../services/user');
const documentService = require('../services/document');
const sharedbService = require('../services/sharedb');

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * @readonly
 * @enum {string}
 */
const ResponseKeys = {
  USER_EMAIL: 'email',
  USER_NAME: 'name',
  USER_STATUS: 'status',
  USER_DOCUMENT_PERMISSION: 'permission',
  DOCUMENTS: 'documents',
  DOCUMENT_ID: 'id',
  DOCUMENT_TITLE: 'title',
  DOCUMENT_CREATE_TIME: 'createTime',
  DOCUMENT_ACCESS: 'access',
  DOCUMENT_COLLECTION: 'collection',
  DOCUMENT_DOCUMENT: 'document',
  DOCUMENT_OWNER: 'owner',
  DOCUMENT_COLLABORATORS: 'collaborators',
  DOCUMENT_EDITOR_INVITING: 'editorInviting',
  DOCUMENT_ANONYMOUS_EDITING: 'anonymousEditing',
  RECAPTCHA_SITE_KEY: 'recaptchaSiteKey',
  ERROR_NOT_ALLOWED: 'errorNotAllowed',
  ERROR_EMAIL_EMPTY: 'errorEmailEmpty',
  ERROR_EMAIL_INVALID: 'errorEmailInvalid',
  ERROR_EMAIL_NOT_EXIST: 'errorEmailNotExist',
  ERROR_EMAIL_OCCUPIED: 'errorEmailOccupied',
  ERROR_NAME_EMPTY: 'errorNameEmpty',
  ERROR_PASSWORD_EMPTY: 'errorPasswordEmpty',
  ERROR_PASSWORD_SHORT: 'errorPasswordShort',
  ERROR_CREDENTIAL_INVALID: 'errorCredentialInvalid',
  ERROR_RECAPTCHA_INVALID: 'errorRecaptchaInvalid'
};

function isEmailValid(email) {
  return /[^@]+@[^@]+/.test(email);
}

function hasAnyError(errors) {
  return Object.keys(errors).findIndex(key => errors[key]) !== -1;
}

function sanitizeSignUpForm(body) {
  const errors = {};

  let email = body.email;
  if (!email || !email.trim().length) {
    errors[ResponseKeys.ERROR_EMAIL_EMPTY] = true;
  } else {
    email = email.trim();
    if (!isEmailValid(email)) {
      errors[ResponseKeys.ERROR_EMAIL_INVALID] = true;
    }
  }

  let name = body.name;
  if (!name || !name.trim().length) {
    errors[ResponseKeys.ERROR_NAME_EMPTY] = true;
  } else {
    name = name.trim();
  }

  const password = body.password;
  if (!password) {
    errors[ResponseKeys.ERROR_PASSWORD_EMPTY] = true;
  } else if (password.length < 6) {
    errors[ResponseKeys.ERROR_PASSWORD_SHORT] = true;
  }

  const recaptcha = body.recaptcha;

  return { email, name, password, recaptcha, errors };
}

function sanitizeSignInForm(body) {
  const errors = {};

  let email = body.email;
  if (!email || !email.trim().length) {
    errors[ResponseKeys.ERROR_EMAIL_EMPTY] = true;
  } else {
    email = email.trim();
    if (!isEmailValid(email)) {
      errors[ResponseKeys.ERROR_EMAIL_INVALID] = true;
    }
  }

  const password = body.password;
  if (!password) {
    errors[ResponseKeys.ERROR_PASSWORD_EMPTY] = true;
  }

  const remember = body.remember;
  const recaptcha = body.recaptcha;

  return { email, password, remember, recaptcha, errors };
}

function sanitizeUpdateProfileForm(body) {
  const errors = {};

  let name = body.name;
  if (!name || !name.trim().length) {
    errors[ResponseKeys.ERROR_NAME_EMPTY] = true;
  } else {
    name = name.trim();
  }

  return { name, errors };
}

function sanitizeUpdatePasswordForm(body) {
  const errors = {};

  const oldPassword = body.oldPassword;

  const newPassword = body.newPassword;
  if (!newPassword) {
    errors[ResponseKeys.ERROR_PASSWORD_EMPTY] = true;
  } else if (newPassword.length < 6) {
    errors[ResponseKeys.ERROR_PASSWORD_SHORT] = true;
  }

  const recaptcha = body.recaptcha;

  return { oldPassword, newPassword, recaptcha, errors };
}

/**
 * An express middleware to ensure user has logged in.
 */
function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    res.status(403).end();
    return;
  }
  next();
}

router.get('/users/:email', function (req, res, next) {
  userService.findUserByEmail(req.params.email)
    .then(user => res.send({
      [ResponseKeys.USER_EMAIL]: user.email,
      [ResponseKeys.USER_NAME]: user.name
    }))
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_USER_NOT_FOUND:
            res.status(404).end();
            return;
          default:
            break;
        }
      }
      next(err);
    });
});

router.get('/profile', ensureLoggedIn, function (req, res, next) {
  userService.findUser(req.user._id)
    .then(user => res.send({
      [ResponseKeys.USER_EMAIL]: user.email,
      [ResponseKeys.USER_NAME]: user.name,
      [ResponseKeys.USER_STATUS]: user.status,
      [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
    }))
    .catch(err => next(err));
});

router.put('/settings/profile', ensureLoggedIn, function (req, res, next) {
  const form = sanitizeUpdateProfileForm(req.body);
  if (hasAnyError(form.errors)) {
    res.status(422).send(form.errors);
    return;
  }
  userService.updateUserName(req.user, form.name)
    .then(() => res.status(204).end())
    .catch(err => next(err));
});

router.put('/settings/password', ensureLoggedIn, function (req, res, next) {
  const form = sanitizeUpdatePasswordForm(req.body);
  if (hasAnyError(form.errors)) {
    res.status(422).send(form.errors);
    return;
  }
  recaptchaService.verifyPasswordAttempt(req.user.password_attempts, form.recaptcha)
    .then(() => userService.verifyPassword(req.user, form.oldPassword))
    .then(() => userService.updateUserPassword(req.user, form.newPassword))
    .then(() => res.status(204).end())
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_RECAPTCHA_MISMATCH:
            res.status(422).send({
              [ResponseKeys.ERROR_RECAPTCHA_INVALID]: true,
              [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getPasswordAttemptSiteKey(req.user.password_attempts)
            });
            return;
          case ClientErrorCode.ERROR_PASSWORD_MISMATCH: {
            let user = err.errorInfo;
            res.status(422).send({
              [ResponseKeys.ERROR_CREDENTIAL_INVALID]: true,
              [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
            });
            return;
          }
          default:
            break;
        }
      }
      next(err);
    });
});

router.get('/signup', function (req, res) {
  if (!config.ALLOW_SIGN_UP) {
    res.status(403).send({ [ResponseKeys.ERROR_NOT_ALLOWED]: true });
    return;
  }
  res.send({ [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getSignUpSiteKey() });
});

router.post('/signup', function (req, res, next) {
  if (!config.ALLOW_SIGN_UP) {
    res.status(403).send({ [ResponseKeys.ERROR_NOT_ALLOWED]: true });
    return;
  }
  const form = sanitizeSignUpForm(req.body);
  if (hasAnyError(form.errors)) {
    res.status(422).send(Object.assign(form.errors, {
      [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getSignUpSiteKey()
    }));
    return;
  }
  recaptchaService.verifySignUp(form.recaptcha)
    .then(() => userService.createUser(form.name, form.email, form.password))
    .then((user) => {
      req.session.userID = user._id;
      res.status(201).end();
    })
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_RECAPTCHA_MISMATCH:
            res.status(422).send({
              [ResponseKeys.ERROR_RECAPTCHA_INVALID]: true,
              [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getSignUpSiteKey()
            });
            return;
          case ClientErrorCode.ERROR_DUPLICATED_USER:
            res.status(409).send({
              [ResponseKeys.ERROR_EMAIL_OCCUPIED]: true,
              [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getSignUpSiteKey()
            });
            return;
          default:
            break;
        }
      }
      next(err);
    });
});

router.get('/signin/:email', function (req, res, next) {
  userService.findUserByEmail(req.params.email)
    .then(user => res.send({
      [ResponseKeys.USER_EMAIL]: user.email,
      [ResponseKeys.USER_NAME]: user.name,
      [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
    }))
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_USER_NOT_FOUND:
            res.status(404).end();
            return;
          default:
            break;
        }
      }
      next(err);
    });
});

router.post('/signin', function (req, res, next) {
  const form = sanitizeSignInForm(req.body);
  if (hasAnyError(form.errors)) {
    res.status(422).send(form.errors);
    return;
  }
  userService.findUserByEmail(form.email)
    .then(user =>
      recaptchaService.verifyPasswordAttempt(user.password_attempts, form.recaptcha)
        .then(() => user)
        .catch((err) => {
          if (err instanceof ClientError && err.errorCode === ClientErrorCode.ERROR_RECAPTCHA_MISMATCH) {
            err.errorInfo = user;
          }
          throw err;
        }))
    .then(user => userService.verifyPassword(user, form.password))
    .then(user => (form.remember ? userService.issueLoginToken(user) : Promise.resolve({ user })))
    .then(({ user, token }) => {
      if (token) {
        res.cookie(config.LOGIN_TOKEN_NAME, token._id, {
          expires: token.expires,
          signed: true
        });
      }
      req.session.userID = user._id;
      res.status(204).end();
    })
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_USER_NOT_FOUND:
            res.status(422).send({
              [ResponseKeys.ERROR_EMAIL_NOT_EXIST]: true
            });
            return;
          case ClientErrorCode.ERROR_RECAPTCHA_MISMATCH: {
            let user = err.errorInfo;
            res.status(422).send({
              [ResponseKeys.ERROR_RECAPTCHA_INVALID]: true,
              [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
            });
            return;
          }
          case ClientErrorCode.ERROR_PASSWORD_MISMATCH: {
            let user = err.errorInfo;
            res.status(422).send({
              [ResponseKeys.ERROR_CREDENTIAL_INVALID]: true,
              [ResponseKeys.RECAPTCHA_SITE_KEY]: recaptchaService.getPasswordAttemptSiteKey(user.password_attempts)
            });
            return;
          }
          default:
            break;
        }
      }
      next(err);
    });
});

router.post('/signout', ensureLoggedIn, function (req, res) {
  delete req.session.userID;
  res.clearCookie(config.LOGIN_TOKEN_NAME, {});
  res.status(204).end();
});

router.get('/notes', function (req, res, next) {
  if (!req.user) {
    res.send({});
    return;
  }
  documentService.findAccessible(req.user)
    .then(docs => res.send({
      [ResponseKeys.USER_NAME]: req.user.name,
      [ResponseKeys.USER_EMAIL]: req.user.email,
      [ResponseKeys.DOCUMENTS]: docs.map(doc => ({
        [ResponseKeys.DOCUMENT_ID]: doc._id,
        [ResponseKeys.DOCUMENT_TITLE]: doc.title,
        [ResponseKeys.DOCUMENT_CREATE_TIME]: doc.created_at,
        [ResponseKeys.DOCUMENT_ACCESS]: doc.userAccess
      }))
    }))
    .catch(err => next(err));
});

router.post('/notes', function (req, res, next) {
  if (!config.ALLOW_ANONYMOUS_CREATING && !req.user) {
    res.status(403).end();
    return;
  }
  const userID = req.user ? req.user._id : null;
  sharedbService.createDocument(config.DOCUMENT_COLLECTION_NAME)
    .then(doc => documentService.createDocument(doc.id, doc.collection, userID, doc.title))
    .then(doc => res.send({
      [ResponseKeys.DOCUMENT_ID]: doc.id,
      [ResponseKeys.DOCUMENT_TITLE]: doc.title,
      [ResponseKeys.DOCUMENT_CREATE_TIME]: doc.created_at
    }))
    .catch(e => next(e));
});

router.get('/notes/:docID', function (req, res, next) {
  documentService.find(req.params.docID)
    .then((doc) => {
      // Populate basic document information
      const docInfo = {
        [ResponseKeys.DOCUMENT_COLLECTION]: doc.doc_collection,
        [ResponseKeys.DOCUMENT_DOCUMENT]: doc._id,
        [ResponseKeys.DOCUMENT_OWNER]: {},
        [ResponseKeys.DOCUMENT_COLLABORATORS]: [],
        [ResponseKeys.DOCUMENT_EDITOR_INVITING]: !!doc.editor_inviting
      };
      switch (doc.public_access) {
        case 'edit':
          docInfo[ResponseKeys.DOCUMENT_ANONYMOUS_EDITING] = 'edit';
          break;
        case 'view':
          docInfo[ResponseKeys.DOCUMENT_ANONYMOUS_EDITING] = 'view';
          break;
        default:
          docInfo[ResponseKeys.DOCUMENT_ANONYMOUS_EDITING] = 'deny';
          break;
      }

      // Gather user IDs with access permission
      const ids = [];
      if (doc.owner) {
        ids.push(doc.owner);
      }
      Array.prototype.push.apply(ids, doc.viewable);
      Array.prototype.push.apply(ids, doc.editable);

      // Check whether user can access this document
      if (docInfo[ResponseKeys.DOCUMENT_ANONYMOUS_EDITING] === 'deny' &&
          (!req.user || !ids.find(id => id.equals(req.user._id)))) {
        throw new ClientError(ClientErrorCode.ERROR_DOCUMENT_NOT_FOUND);
      }

      return userService.findUsers(ids).then(users => ({ doc, docInfo, users }));
    })
    .then(({ doc, docInfo, users }) => {
      // Populate collaborators
      const userMap = users.reduce((map, user) => { map[user._id] = user; return map; }, {});
      if (typeof userMap[doc.owner] !== 'undefined') {
        docInfo[ResponseKeys.DOCUMENT_OWNER] = {
          [ResponseKeys.USER_EMAIL]: userMap[doc.owner].email,
          [ResponseKeys.USER_NAME]: userMap[doc.owner].name
        };
      }
      [{ list: doc.viewable, permission: 'view' }, { list: doc.editable, permission: 'edit' }]
        .forEach(({ list, permission }) => {
          list.forEach((id) => {
            if (typeof userMap[id] !== 'undefined') {
              docInfo[ResponseKeys.DOCUMENT_COLLABORATORS].push({
                [ResponseKeys.USER_EMAIL]: userMap[id].email,
                [ResponseKeys.USER_NAME]: userMap[id].name,
                [ResponseKeys.USER_DOCUMENT_PERMISSION]: permission
              });
            }
          })
        });
      docInfo[ResponseKeys.DOCUMENT_COLLABORATORS]
        .sort((a, b) => a.email.toLowerCase().localeCompare(b.email.toLowerCase()));

      // Send result
      res.send(docInfo);
    })
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_DOCUMENT_NOT_FOUND:
            res.status(404).end();
            return;
          default:
            break;
        }
      }
      next(err);
    });
});

router.put('/notes/:docID', ensureLoggedIn, function (req, res, next) {
  documentService.find(req.params.docID)
    .then((doc) => {
      if (!doc.owner) {
        throw new ClientError(ClientErrorCode.ERROR_DOCUMENT_ACCESS_DENIED);
      }

      // Check whether user is allowed to modify document sharing settings
      if (!doc.owner.equals(req.user._id) &&
          (!doc.editor_inviting || !doc.editable.find(id => id.equals(req.user._id)))) {
        throw new ClientError(ClientErrorCode.ERROR_DOCUMENT_ACCESS_DENIED);
      }

      // Populate collaborators
      const collaborators = {};
      req.body.collaborators.forEach(item => (collaborators[item.email] = item.permission));

      return userService.findUsersByEmails(Object.keys(collaborators)).then(users => ({ doc, collaborators, users }));
    })
    .then(({ doc, collaborators, users }) => {
      const editable = [];
      const viewable = [];
      users.forEach((user) => {
        if (collaborators[user.email] === 'edit') {
          editable.push(user._id);
        } else {
          viewable.push(user._id);
        }
      });
      doc.viewable = viewable;
      doc.editable = editable;

      // Only owner can modify certain settings
      if (doc.owner.equals(req.user._id)) {
        doc.public_access = req.body.anonymousEditing;
        doc.editor_inviting = !!req.body.editorInviting;
      }

      return doc.save().then(() => doc);
    })
    .then(doc => sharedbService.broadcastPermissionChange(doc.doc_collection, doc._id))
    .then(() => res.status(204).end())
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_DOCUMENT_NOT_FOUND:
            res.status(404).end();
            return;
          case ClientErrorCode.ERROR_DOCUMENT_ACCESS_DENIED:
            res.status(403).end();
            return;
          default:
            break;
        }
      }
      next(err);
    });
});

router.delete('/notes/:docID', ensureLoggedIn, function (req, res, next) {
  documentService.find(req.params.docID)
    .then((doc) => {
      if (!doc.owner) {
        throw new ClientError(ClientErrorCode.ERROR_DOCUMENT_ACCESS_DENIED);
      }

      // Check whether user is allowed to modify document sharing settings
      if (!doc.owner.equals(req.user._id)) {
        throw new ClientError(ClientErrorCode.ERROR_DOCUMENT_ACCESS_DENIED);
      }

      // Mark document deleted
      doc.deleted_at = new Date();

      return doc.save().then(() => doc);
    })
    .then(doc => sharedbService.broadcastPermissionChange(doc.doc_collection, doc._id))
    .then(() => res.status(204).end())
    .catch((err) => {
      if (err instanceof ClientError) {
        switch (err.errorCode) {
          case ClientErrorCode.ERROR_DOCUMENT_NOT_FOUND:
            res.status(404).end();
            return;
          case ClientErrorCode.ERROR_DOCUMENT_ACCESS_DENIED:
            res.status(403).end();
            return;
          default:
            break;
        }
      }
      next(err);
    });
});

module.exports = router;
