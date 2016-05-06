'use strict';

const express = require('express');
const userService = require('../services/user');
const handleShareDBConnection = require('../sharedb').handleSocketConnection;

const router = express.Router();

function verifyCredentialForm(req, signupForm) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = {};
  if (!email || !email.trim().length) {
    errors.formValidationEmailEmpty = true;
  }
  if (!password) {
    errors.formValidationPasswordEmpty = true;
  }
  if (signupForm) {
    if (!name || !name.trim().length) {
      errors.formValidationNameEmpty = true;
    }
    if (password && password.length < 6) {
      errors.formValidationPasswordShort = true;
    }
  }
  return { name, email, password, errors };
}

function allValid(errors) {
  for (let key in errors) {
    if (!errors.hasOwnProperty(key)) {
      continue;
    }
    if (errors[key]) {
      return false;
    }
  }
  return true;
}

router.get('/', (req, res) => res.render('index'));
router.get('/signin', (req, res) => res.render('index'));
router.get('/signup', (req, res) => res.render('index'));
router.ws('/notes', handleShareDBConnection);
router.get('/notes', (req, res) => res.render('notes'));
router.get('/notes/*', (req, res) => res.render('notes'));

router.post('/signup', function (req, res, next) {
  const form = verifyCredentialForm(req, true);
  if (!allValid(form.errors)) {
    res.status(400).send(form.errors);
    return;
  }
  userService.createUser(form.name, form.email, form.password, function (err, user) {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).send({ formValidationEmailOccupied: true });
        return;
      }
      return next(err);
    }
    req.session.email = user.email;
    res.status(201).end();
  });
});

router.post('/signin', function (req, res, next) {
  const form = verifyCredentialForm(req, false);
  if (!allValid(form.errors)) {
    res.status(400).send(form.errors);
    return;
  }
  userService.verifyUser(req.body.email, req.body.password, req.body.recaptcha, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(403).send({ formValidationCredentialInvalid: true });
    }
    userService.resetLoginAttempts(user.email, function (err) {
      if (err) {
        return next(err);
      }
      req.session.email = user.email;
      res.status(204).end();
    });
  });
});

module.exports = router;
