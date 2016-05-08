'use strict';

const express = require('express');
const config = require('../config');
const userService = require('../services/user');
const handleShareDBConnection = require('../sharedb').handleSocketConnection;

const router = express.Router();

function verifyCredentialForm(req, signupForm) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const recaptcha = req.body.recaptcha;
  const errors = {};
  if (!email || !email.trim().length) {
    errors.validationEmailEmpty = true;
  }
  if (!password) {
    errors.validationPasswordEmpty = true;
  }
  if (signupForm) {
    if (!name || !name.trim().length) {
      errors.validationNameEmpty = true;
    }
    if (password && password.length < 6) {
      errors.validationPasswordShort = true;
    }
  }
  return { name, email, password, recaptcha, errors };
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
  if (!config.allowSignUp) {
    res.status(403).send({ validationNotAllowed: true });
    return;
  }
  const form = verifyCredentialForm(req, true);
  if (!allValid(form.errors)) {
    res.status(400).send(form.errors);
    return;
  }
  userService.createUser(form.name, form.email, form.password, form.recaptcha, function (err, result) {
    if (err) {
      return next(err);
    }
    if (result.recaptcha === 1) {
      res.status(403).send({
        validationRecaptchaInvalid: true,
        recaptchaSiteKey: result.siteKey
      });
      return;
    }
    if (result.duplicate === 1) {
      res.status(409).send({
        validationEmailOccupied: true,
        recaptchaSiteKey: result.siteKey
      });
      return;
    }
    const user = result.user;
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
  userService.verifyUser(form.email, form.password, form.recaptcha,
    function (err, result) {
      if (err) {
        return next(err);
      }
      if (result.recaptcha === 1) {
        res.status(403).send({
          validationRecaptchaInvalid: true,
          recaptchaSiteKey: result.siteKey
        });
        return;
      }
      if (result.password === 1) {
        res.status(403).send({
          validationCredentialInvalid: true,
          recaptchaSiteKey: result.siteKey
        });
        return;
      }
      const user = result.user;
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
