// jshint esversion: 6
// jshint node: true
"use strict";

var express = require('express');
var router = express.Router();
const request = require('request');

const {refreshToken} = require('../helper/middleware/refreshToken');


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Open Badges' });
// });

/* GET Start page. */
// router.get('/', refreshToken, function(req, res, next) {
//   console.log(req.me);
//   res.render('Start', {
//     me: req.me
//   });
// });


router.get('/', refreshToken, function (req, res){
  var body = {
    startdate: Date.now()
  };
  console.log(body);
  var options = {
    url: process.env.API_Domain+'/api/v1/course',
    qs: body
  };
  request.get(options)
  .on('response', function(response) {
    // concatenate updates from datastream
    var body = '';
    response.on('data', function(chunk){
      //console.log("chunk: " + chunk);
      body += chunk;
    });
    response.on('end', function(){
      console.log(JSON.parse(body));
      if(response.statusCode !== 200){
        // flash?
        return res.render('Start', {
          title: 'Start',
          courses: [],
          me: req.me
        });
      }
      res.render('Start', {
        title: 'Start',
        courses: JSON.parse(body).courses,
        me: req.me
      });
    });
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
// router.get('/badges', refreshToken, function(req, res, next) {
//   res.render('badgelist', {
//     me: req.me
//   });
// });
// router.get('/kurse/meine', function(req, res, next) {
//   res.render('belegteKurse');
// });
module.exports = router;
