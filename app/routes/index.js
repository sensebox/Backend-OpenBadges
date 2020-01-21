// jshint esversion: 6
// jshint node: true
"use strict";

var express = require('express');
var router = express.Router();

const {refreshToken} = require('../helper/middleware/refreshToken');


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Open Badges' });
// });

/* GET Start page. */
router.get('/', refreshToken, function(req, res, next) {
  console.log(req.me);
  res.render('Start', {
    me: req.me
  });
});


// router.get('/kontakt', function(req, res, next) {
//   res.render('Kontaktformular');
// });
// router.get('/nutzer/registrierung', function(req, res, next) {
//   res.render('registrierung');
// });
// router.get('/kurse', function(req, res, next) {
//   res.render('kursliste');
// });
// router.get('/nutzer/login', function(req, res, next) {
//   res.render('loginnew');
// });
/* GET kursRegistrierung. */
// router.get('/kurse/registrierung', function(req, res, next) {
//     res.render('kursRegistrierung');
// });
// router.get('/kurse/:kursId', function(req, res, next) {
//   res.render('Kursseite');
// });
// router.get('/nutzer/profil', function(req, res, next) {
//   res.render('Kontoseite');
// });
router.get('/nutzer/passwort', function(req, res, next) {
  res.render('pwlost');
});
// router.get('/badges', refreshToken, function(req, res, next) {
//   res.render('badgelist', {
//     me: req.me
//   });
// });
// router.get('/kurse/meine', function(req, res, next) {
//   res.render('belegteKurse');
// });
module.exports = router;
