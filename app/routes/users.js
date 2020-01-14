// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken, cookieExtractor} = require('../helper/refreshToken_Client');


router.get('/registrieren', function (req, res){
  res.render('registrierung', {
    title: 'Registrieren'
  });
});


router.post('/registrieren', function (req, res){
  var url = process.env.API_Domain+'/api/v1/user/signup';
  request.post(url, {form: req.body})
    .on('response', function(response) {
      // concatenate updates from datastream
      var body = '';
      response.on('data', function(chunk){
          //console.log("chunk: " + chunk);
          body += chunk;
      });
      response.on('end', function(){
        if(response.statusCode !== 201){
          req.flash('error', 'Es ist ein Fehler beim Registriern aufgetreten.');
          return res.redirect('/nutzer/registrieren');
          // return res.status(400).send(JSON.parse(body));
        }
        req.flash('success', 'Sie haben sich erfolgreich registriert.');
        res.redirect('/nutzer/anmelden');
      });
    })
    .on('error', function(err) {
      return res.status(400).send('Fehler');
  });
});


router.get('/anmelden', async function (req, res){
  res.render('loginnew', {
    title: 'Login'
  });
});


router.post('/anmelden', function (req, res){
  var url = process.env.API_Domain+'/api/v1/user/signin';
  console.log(req.body);
  request.post(url, {form: req.body})
    .on('response', function(response) {
      // concatenate updates from datastream
      var body = '';
      response.on('data', function(chunk){
          //console.log("chunk: " + chunk);
          body += chunk;
      });
      response.on('end', function(){
        console.log(body);
        if(response.statusCode !== 200){
          // login not successfully
          req.flash('error', 'Benutzername oder Passwort ist falsch.');
          return res.status(400).redirect('/nutzer/anmelden');
        }
        // token is generated
        // set cookies (name: "access" and "refresh") with token as content
        const cookieOptions = {
          httpOnly: true, // the cookie only accessible by the web server
        };
        res.cookie('access', (JSON.parse(body)).token, cookieOptions);
        cookieOptions.maxAge = process.env.COOKIE_MaxAge;
        res.cookie('refresh', (JSON.parse(body)).refreshToken, cookieOptions);
        return res.redirect('/');
      });
    })
    .on('error', function(err) {
      return res.status(400).send('Fehler');
  });
});


router.get('/abmelden', function(req, res){
  var token = cookieExtractor(req, 'access');
  var options = {
    url: process.env.API_Domain+'/api/v1/user/signout',
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
              req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
              return res.redirect('/nutzer/anmelden');
            }, function(){
              // token is successfull refreshed
              return res.redirect('/nutzer/abmelden');
          });
        }
        res.clearCookie('access');
        res.clearCookie('refresh');
        req.flash('success', 'Sie haben sich erfolgreich abgemeldet.');
        res.redirect('/nutzer/anmelden');
      });
    })
    .on('error', function(err) {
      return res.status(400).send('Fehler');
  });
});



router.get('/profil', function (req, res){
  var token = cookieExtractor(req, 'access');
  var options = {
    url: process.env.API_Domain+'/api/v1/user/me',
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
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
            return res.redirect('/nutzer/anmelden');
          }, function(){
            // token is successfull refreshed
            return res.redirect('/nutzer/profil');
        });
      }
      console.log(3, JSON.parse(body));
      res.render('Kontoseite', {
        title: 'Profil',
        user: JSON.parse(body).user
      });
    });
  });
});



router.post('/profil', function (req, res){
  console.log('Los');
  var token = cookieExtractor(req, 'access');
  var options = {
    method: 'PUT',
    url: process.env.API_Domain+'/api/v1/user/me',
    headers: {
      'Authorization': 'Bearer '+token
    },
    form: req.body
  };
  request(options)
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
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
            return res.redirect('/nutzer/anmelden');
          }, function(){
            // token is successfull refreshed
            // return res.redirect('/nutzer/profil');
            var token = cookieExtractor(req, 'access');
            var options = {
              url: process.env.API_Domain+'/api/v1/user/me',
              headers: {
                'Authorization': 'Bearer '+token
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
                  // flash: error
                  req.flash('error', 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
                  return res.redirect('/nutzer/anmelden');
                }
                if(JSON.parse(body).message == 'User information updated successfully.'){
                    req.flash('success', 'Ihre Nutzerdaten wurden erfolgreich aktualisiert.');
                } else {
                  req.flash('info', 'Ihre Nutzerdaten haben sich nicht verändert.');
                }
                res.redirect('/nutzer/profil');
              });
            });
        });
      }
      if(JSON.parse(body).message == 'User information updated successfully.'){
          req.flash('success', 'Ihre Nutzerdaten wurden erfolgreich aktualisiert.');
      } else {
        req.flash('info', 'Ihre Nutzerdaten haben sich nicht verändert.');
      }
      res.redirect('/nutzer/profil');
    });
  });
});




router.post('/loeschen', function (req, res){
  var token = cookieExtractor(req, 'access');
  var options = {
    method: 'DELETE',
    url: process.env.API_Domain+'/api/v1/user/me',
    headers: {
      'Authorization': 'Bearer '+token
    }
  };
  request(options)
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
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
            return res.redirect('/nutzer/anmelden');
          }, function(){
            // token is successfull refreshed
            var token = cookieExtractor(req, 'access');
            var options = {
              method: 'delete',
              url: process.env.API_Domain+'/api/v1/user/me',
              headers: {
                'Authorization': 'Bearer '+token
              }
            };
            request(options)
            .on('response', function(response) {
              // concatenate updates from datastream
              var body = '';
              response.on('data', function(chunk){
                //console.log("chunk: " + chunk);
                body += chunk;
              });
              response.on('end', function(){
                if(response.statusCode !== 200){
                  // error
                  req.flash('error', 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
                  res.redirect('/nutzer/anmelden');
                }
                req.flash('success', 'Ihr Konto und alle damit verbundenen Verknüpfungen wurden erfolgreich gelöscht.');
                res.redirect('/nutzer/anmelden');
              });
            });
        });
      }
      req.flash('success', 'Ihr Konto und alle damit verbundenen Verknüpfungen wurden erfolgreich gelöscht.');
      res.redirect('/nutzer/anmelden');
    });
  });
});


module.exports = router;
