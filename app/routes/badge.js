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
      url: process.env.API_Domain+'/api/v1/badge',
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
          console.log(body);
          if(response.statusCode !== 201){
            if(response.statusCode === 422){
              req.flash('error', JSON.parse(body).message);
              return res.redirect('/badge/registrierung');
            }
            req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
            return res.redirect('/nutzer/anmelden');
          }
          req.flash('success', 'Sie haben erfolgreich ein Badge erstellt.');
          res.redirect('/kurse/registrierung');
        });
      });
  }
  else {
    req.flash('error', 'Die angeforderten Informationen stimmen nicht mit Ihrem Benutzerkonto überein. Melden Sie sich bitte wieder an.');
    return res.redirect('/nutzer/anmelden');
  }
});



router.get('/registrierung', refreshToken, function(req, res){
  if(req.authorized){
    res.render('badgeRegistrierung', {
      title: 'Badgeregistrierung',
      me: req.me
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
      url: process.env.API_Domain+'/api/v1/badge/me',
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
        res.render('badgelist', {
          title: 'meine Badges',
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


module.exports = router;
