const express = require('express');
const handleShareDBConnection = require('../sharedb').handleSocketConnection;

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

router.ws('/notes', handleShareDBConnection);
router.get('/notes', (req, res) => res.render('notes'));
router.get('/notes/*', (req, res) => res.render('notes'));

router.get('/settings', (req, res) => res.render('notes'));
router.get('/settings/*', (req, res) => res.render('notes'));

module.exports = router;
