var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Open Badges' });
});

/* GET Start page. */
module.exports = router;
router.get('/begin', function(req, res, next) {
  res.render('Start');
});
router.get('/Kontaktformular', function(req, res, next) {
  res.render('Kontaktformular');
});
router.get('/registrierung', function(req, res, next) {
  res.render('registrierung');
});
router.get('/Kursliste', function(req, res, next) {
  res.render('kursliste');
});
router.get('/login', function(req, res, next) {
  res.render('login');
});
