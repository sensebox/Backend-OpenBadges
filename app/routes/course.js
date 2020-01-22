// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken} = require('../helper/middleware/refreshToken');



router.post('/registrierung', refreshToken, function(req, res){
  if(req.authorized){
    var body = req.body;
    if(!Array.isArray(body.localbadge)) body.localbadge = [req.body.localbadge];
    if(!Array.isArray(body.badge)) body.badge = [req.body.badge];
    if(req.body.coordinates) body.coordinates = JSON.parse(req.body.coordinates);
    console.log(body);
    var options = {
      url: process.env.API_Domain+'/api/v1/course',
      headers: {
        'Authorization': 'Bearer '+ req.token
      },
      form: req.body
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
          if(response.statusCode !== 201){
            if(response.statusCode === 422){
              req.flash('error', JSON.parse(body).message);
              return res.redirect('/kurse/registrierung');
            }
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
            return res.redirect('/nutzer/anmelden');
          }
          req.flash('success', 'Sie haben erfolgreich einen Kurs erstellt.');
          res.redirect('/');
        });
      });
  }
  else {
    req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
    res.redirect('/nutzer/anmelden');
  }
});


router.post('/:kursId/anmelden', refreshToken, function(req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId+'/user/registration',
      headers: {
        'Authorization': 'Bearer '+ req.token
      }
    };
    request.put(options)
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
            if(JSON.parse(body).message == 'Course size is already reached.'){
              req.flash('error', 'Der Kurs ist bereits ausgebucht.');
              return res.redirect('/kurse/meine');
            }
            else{
              req.flash('info', 'Sie sind bereits im Kurs angemeldet.');
              return res.redirect('/kurse/meine');
            }
          }
          req.flash('success', 'Sie haben sich erfolgreich für den Kurs angemeldet.');
          res.redirect('/kurse/meine');
        });
      });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});


router.post('/:kursId/abmelden', refreshToken, function(req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId+'/user/deregistration',
      headers: {
        'Authorization': 'Bearer '+ req.token
      }
    };
    request.put(options)
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
            if(JSON.parse(body).message == 'User is not registered in course.'){
              req.flash('info', 'Sie sind nicht für den Kurs angemeldet.');
              return res.redirect('/kurse');
            }
          }
          req.flash('success', 'Sie haben sich erfolgreich von dem Kurs abgemeldet.');
          res.redirect('/kurse');
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
    var body = {};
    if(req.query.name) body.name = req.query.name;
    if(req.query.topic) body.topic = req.query.topic;
    if(req.query.startdate) body.startdate = req.query.startdate;
    if(req.query.enddate) body.enddate = req.query.enddate;
    if(req.query.coordinates) body.coordinates = req.query.coordinates;
    if(req.query.radius) body.radius = req.query.radius;
    var options = {
      url: process.env.API_Domain+'/api/v1/course/me',
      headers: {
        'Authorization': 'Bearer '+ req.token
      },
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
        if(response.statusCode !== 200){
          console.log(body);
          return res.redirect('/nutzer/anmelden');
        }
        console.log(JSON.parse(body).courses);
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



router.get('/meine/erstellt', refreshToken,  function (req, res){
  console.log('Authorized', req.authorized);
  if(req.authorized){
    var body = {};
    if(req.query.name) body.name = req.query.name;
    if(req.query.topic) body.topic = req.query.topic;
    if(req.query.startdate) body.startdate = req.query.startdate;
    if(req.query.enddate) body.enddate = req.query.enddate;
    if(req.query.coordinates) body.coordinates = req.query.coordinates;
    if(req.query.radius) body.radius = req.query.radius;
    var options = {
      url: process.env.API_Domain+'/api/v1/course/creator/me',
      headers: {
        'Authorization': 'Bearer '+ req.token
      },
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
        if(response.statusCode !== 200){
          console.log(body);
          return res.redirect('/nutzer/anmelden');
        }
        console.log(JSON.parse(body).courses);
        res.render('Kursliste', {
          title: 'meine erstellten Kurse',
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



router.get('/:kursId/teilnehmer', refreshToken, function (req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId +'/participants',
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
        console.log(JSON.parse(body));
        if(response.statusCode !== 200){
          // Kurs existiert nicht
          return res.redirect('/kurse/meine/erstellt');
        }
        var participants = JSON.parse(body).participants;
        res.render('teilnehmerliste', {
          title: 'Teilnehmerliste',
          participants: participants,
          me: req.me
        });
      });
    });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});



router.get('/:kursId/bearbeiten', refreshToken, function (req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId,
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
          // Kurs existiert nicht
          return res.redirect('/kurse/meine/erstellt');
        }
        var course = JSON.parse(body).course;
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
              return res.redirect('/kurse/meine/erstellt');
            }
            var badges = JSON.parse(body).badges;
            res.render('kursBearbeitung', {
              title: 'Kursbearbeitung',
              course: course,
              badges: badges,
              me: req.me
            });
          });
        });
      });
    });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});



router.post('/:kursId/bearbeiten', refreshToken, function(req, res){
  if(req.authorized){
    var body = req.body;
    if(!Array.isArray(body.localbadge)) body.localbadge = [req.body.localbadge];
    if(!Array.isArray(body.badge)) body.badge = [req.body.badge];
    if(req.body.coordinates) body.coordinates = JSON.parse(req.body.coordinates);
    var options = {
      url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId,
      headers: {
        'Authorization': 'Bearer '+ req.token
      },
      form: req.body
    };
    request.put(options)
      .on('response', function(response) {
        // concatenate updates from datastream
        var body = '';
        response.on('data', function(chunk){
            //console.log("chunk: " + chunk);
            body += chunk;
        });
        response.on('end', function(){
          if(response.statusCode !== 200){
            if(response.statusCode === 422){
              req.flash('error', JSON.parse(body).message);
              return res.redirect('/kurse/'+req.params.kursId+'/bearbeiten');
            }
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
            return res.redirect('/nutzer/anmelden');
          }
          req.flash('success', 'Sie haben erfolgreich den Kurs aktualisiert.');
          res.redirect('/kurse/'+req.params.kursId);
        });
      });
  }
  else {
    req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
    res.redirect('/nutzer/anmelden');
  }
});



router.post('/:kursId/deaktivieren', refreshToken, function(req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/course/'+req.params.kursId + '/deactivation',
      headers: {
        'Authorization': 'Bearer '+ req.token
      }
    };
    request.put(options)
      .on('response', function(response) {
        // concatenate updates from datastream
        var body = '';
        response.on('data', function(chunk){
            //console.log("chunk: " + chunk);
            body += chunk;
        });
        response.on('end', function(){
          if(response.statusCode !== 200){
            req.flash('error', JSON.parse(body).message);
            return res.redirect('/kurse/'+req.params.kursId);
          }
          req.flash('success', 'Sie haben erfolgreich den Kurs deaktiviert.');
          res.redirect('/kurse/meine/erstellt');
        });
      });
  }
  else {
    req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
    res.redirect('/nutzer/anmelden');
  }
});


router.get('/', refreshToken, function (req, res){
  var body = {};
  if(req.query.name) body.name = req.query.name;
  if(req.query.topic) body.topic = req.query.topic;
  if(req.query.startdate) body.startdate = req.query.startdate;
  if(req.query.enddate) body.enddate = req.query.enddate;
  if(req.query.coordinates) body.coordinates = req.query.coordinates;
  if(req.query.radius) body.radius = req.query.radius;
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


router.get('/:kursId/teilnehmer/badge', refreshToken,  function (req, res){
  if(req.authorized){
    res.render('Nutzerliste', {
      title: 'Badgevergabe'
    });
  }
  else {
    return res.redirect('/nutzer/anmelden');
  }
});


module.exports = router;
