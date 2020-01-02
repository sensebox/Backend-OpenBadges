var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Open Badges' });
});

/* GET Start page. */
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
  res.render('loginnew');
});
/* GET kursRegistrierung. */
router.get('/kursRegistrierung', function(req, res, next) {
    res.render('kursRegistrierung');
});
router.get('/Kursseite', function(req, res, next) {
  res.render('Kursseite');
});
router.get('/Kontoseite', function(req, res, next) {
  res.render('Kontoseite');
});
router.get('/pwlost', function(req, res, next) {
  res.render('pwlost');
});
router.get('/badgelist', function(req, res, next) {
  res.render('badgelist');
});
module.exports = router;
