// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken} = require('../helper/middleware/refreshToken');



router.post('/registrierung', refreshToken, function(req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course',
      headers: {
        'Authorization': 'Bearer '+ req.token
      }
    };
    request.post(options)
      .on('response', function(response) {
        // concatenate updates from datastream
        var body = '';
        response.on('data', function(chunk){
            //console.log("chunk: " + chunk);
            body += chunk;
        });
        response.on('end', function(){
          if(response.statusCode !== 200){
            // error: users refresh Token is invalid, nothing to do
            // falsh?: req.flash('loginError', JSON.parse(body).message);
            return res.redirect('/nutzer/anmelden');
          }
          res.render('kursRegistrierung', {
            title: 'Kursregistrierung'
          });
        });
      });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});


router.get('/registrierung', refreshToken, function(req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/badge',
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
        if(response.statusCode !== 200){
          console.log(response);
          return res.status(400).send('Fehler');
        }
        res.render('kursRegistrierung', {
            title: 'Kursregistrierung',
            badges: JSON.parse(body).badges,
            me: req.me
        });
      });
    });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});


router.get('/meine', refreshToken,  function (req, res){
  console.log('Authorized', req.authorized);
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course/me',
      headers: {
        'Authorization': 'Bearer '+ req.token
      }
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
        if(response.statusCode !== 200){
          console.log(body);
          return res.redirect('/nutzer/anmelden');
        }
        res.render('Kursliste', {
          title: 'meine Kurse',
          courses: JSON.parse(body).courses,
          me: req.me
        });
      });
    });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});


router.get('/:kursId', refreshToken, function (req, res){
  var options = {
    url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId
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
      if(response.statusCode !== 200){
        // flash?
        // Kurs existiert nicht
        return res.render('Kursliste', {
          title: 'Kursliste',
          me: req.me
        });
      }
      var course = JSON.parse(body).course;
      res.render('Kursseite', {
        title: 'Kurs: '+ course.name,
        course: course,
        me: req.me
      });
    });
  });
});



router.get('/', refreshToken, function (req, res){
  var options = {
    url: process.env.API_Domain+'/api/v1/course',
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
        return res.render('Kursliste', {
          title: 'Kursliste',
          me: req.me
        });
      }
      res.render('Kursliste', {
        title: 'Kursliste',
        courses: JSON.parse(body).courses,
        me: req.me
      });
    });
  });
});




module.exports = router;
