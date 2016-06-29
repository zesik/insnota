const express = require('express');
const config = require('../config');
const recaptchaService = require('../services/recaptcha');
const userService = require('../services/user');
const User = require('../models/user');
const handleShareDBConnection = require('../sharedb').handleSocketConnection;

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

router.get('/', function (req, res) {
  if (req.user) {
    res.redirect('notes');
    return;
  }
  res.render('home');
});

router.get('/signin', (req, res) => res.render('account'));
router.get('/signup', (req, res) => res.render('account'));

router.ws('/notes', handleShareDBConnection);
router.get('/notes', (req, res) => res.render('notes'));
router.get('/notes/*', (req, res) => res.render('notes'));

router.get('/settings', (req, res) => res.render('notes'));
router.get('/settings/*', (req, res) => res.render('notes'));

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

router.post('/signin', function (req, res, next) {
  const form = validateSignInForm(req);
  if (!allValid(form.errors)) {
    res.status(422).send(form.errors);
    return;
  }
  userService.findUserByEmail(form.email).then(user => {
    recaptchaService.verifySignIn(user.password_attempts, form.recaptcha).then(() => {
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
            recaptchaSiteKey: recaptchaService.getSignInSiteKey(err.password_attempts)
          });
          return;
        }
        next(err);
      });
    }).catch(err => {   // recaptchaService.verifySignIn rejected
      if (err) {
        next(err);
        return;
      }
      res.status(422).send({
        errorRecaptchaInvalid: true,
        recaptchaSiteKey: recaptchaService.getSignInSiteKey(user.password_attempts)
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

module.exports = router;
