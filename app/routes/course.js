// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken, cookieExtractor} = require('../helper/refreshToken_Client');


router.post('/registrierung', function(req, res){
  var token = cookieExtractor(req, 'access');
  var options = {
    url: process.env.API_Domain+'/api/v1/course',
    headers: {
      'Authorization': 'Bearer '+token
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
          return refreshToken(req, res, function(){
              // error: users refresh Token is invalid, nothing to do
              // falsh?: req.flash('loginError', JSON.parse(body).message);
              return res.redirect('/nutzer/anmelden');
            }, function(){
              // token is successfull refreshed
              return res.redirect('/kurse/registrieren');
          });
        }
        res.render('kursRegistrierung', {
          title: 'Kursregistrierung'
        });
      });
    })
    .on('error', function(err) {
      return res.status(400).send('Fehler');
  });
});


router.get('/registrierung', function(req, res){
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
          badges: JSON.parse(body).badges
      });
    });
  });
});


router.get('/meine', function (req, res){
  var token = cookieExtractor(req, 'access');

  var options = {
    url: process.env.API_Domain+'/api/v1/course/me',
    headers: {
      'Authorization': 'Bearer '+token
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
        return refreshToken(req, res, function(){
            // error: no user signed in
            return res.redirect('/nutzer/anmelden');
          }, function(){
            // token is successfull refreshed
            return res.redirect('/kurse/meine');
        });
      }
      console.log(JSON.parse(body).courses);
      res.render('Kursliste', {
        title: 'meine Kurse',
        courses: JSON.parse(body).courses
      });
    });
  });
});


router.get('/:kursId', function (req, res){
  var options = {
    url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId,
    // form: {
    //   startdate: Date.now()
    // }
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
        // Kurs existiert nicht
        return res.render('Kursliste', {
          title: 'Kursliste'
        });
      }
      var course = JSON.parse(body).course;
      res.render('Kursseite', {
        title: 'Kurs: '+ course.name,
        course: course
      });
    });
  });
});



router.get('/', function (req, res){
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
          title: 'Kursliste'
        });
      }
      res.render('Kursliste', {
        title: 'Kursliste',
        courses: JSON.parse(body).courses
      });
    });
  });
});




module.exports = router;
