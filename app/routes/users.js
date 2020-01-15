// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');

const {base64ArrayBuffer} = require('../helper/upload/base64');
const {upload} = require('../helper/upload/multerStorage');
const {refreshToken} = require('../helper/middleware/refreshToken');

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


router.get('/abmelden', refreshToken, function(req, res){
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/user/signout',
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
          req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
          res.clearCookie('access');
          res.clearCookie('refresh');
          return res.redirect('/nutzer/anmelden');
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
  }
  else {
    req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
    res.clearCookie('access');
    res.clearCookie('refresh');
    return res.redirect('/nutzer/anmelden');
  }
});



router.get('/profil', refreshToken,  function (req, res){
  console.log('Authorized', req.authorized);
  if(req.authorized){
    var options = {
      url: process.env.API_Domain+'/api/v1/user/me',
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

          return res.redirect('/nutzer/anmelden');
        }
        var user = JSON.parse(body).user;
        user.image = 'data:'+ user.contentType+';base64,'+base64ArrayBuffer(user.image.data);
        res.render('Kontoseite', {
          title: 'Profil',
          user: user,
          me: req.me
        });
      });
    });
  }
  else {
    console.log('not authorized');
    return res.redirect('/nutzer/anmelden');
  }
});



router.post('/profil', refreshToken, function (req, res){
  if(req.authorized){
    upload.single('userpicture')(req, res,  (async err => {
      if (err) {
        console.log(err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          // 'File too large'
          req.flash('error', 'Datei ist zu groß, erlaubt sind max. 5MB.');
          return res.redirect('/nutzer/profil');
        }
        else {
          req.flash('error', err);
          return res. redirect('/nutzer/profil');
        }
      }
      else {
        if(req.file != null){
          req.body.image = fs.readFileSync(req.file.path, 'base64');
          req.body.contentType = req.file.mimetype;
        }
      }
      var options = {
        method: 'PUT',
        url: process.env.API_Domain+'/api/v1/user/me',
        headers: {
          'Authorization': 'Bearer '+ req.token
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
            // error: no user signed in
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
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
    }));
  }
  else {
    // flash
    return res.redirect('/nutzer/anmelden');
  }
});


router.post('/loeschen', refreshToken, function (req, res){
  if(req.authorized){
    var options = {
      method: 'DELETE',
      url: process.env.API_Domain+'/api/v1/user/me',
      headers: {
        'Authorization': 'Bearer '+ req.token
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
          // error: no user signed in
          req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
          return res.redirect('/nutzer/anmelden');
        }
        req.flash('success', 'Ihr Konto und alle damit verbundenen Verknüpfungen wurden erfolgreich gelöscht.');
        res.redirect('/nutzer/anmelden');
      });
    });
  }
  else {
    req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
    return res.redirect('/nutzer/anmelden');
  }
});


module.exports = router;
