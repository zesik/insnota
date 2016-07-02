const express = require('express');
const sharedbService = require('../services/sharedb');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function (req, res) {
  if (req.user) {
    res.redirect('notes');
    return;
  }
  res.render('home');
});

router.get('/signin', (req, res) => res.render('account'));
router.get('/signup', (req, res) => res.render('account'));

router.ws('/notes', sharedbService.handleSocketConnection);
router.get('/notes', (req, res) => res.render('notes'));
router.get('/notes/*', (req, res) => res.render('notes'));

router.get('/settings', (req, res) => res.render('notes'));
router.get('/settings/*', (req, res) => res.render('notes'));

module.exports = router;
