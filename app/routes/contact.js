// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken, cookieExtractor} = require('../helper/refreshToken_Client');


router.get('/', function (req, res){
  var token = cookieExtractor(req, 'access');
  if(token){
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
              return res.render('Kontaktformular', {
                title: 'Kontakt'
              });
            }, function(){
              // token is successfull refreshed
              return res.redirect('/kontakt');
          });
        }
        res.render('Kontaktformular', {
          title: 'Kontakt',
          email: JSON.parse(body).user.email
        });
      });
    });
  }
  else {
    res.render('Kontaktformular', {
      title: 'Kontakt'
    });
  }
});



router.post('/', function (req, res){
  var options = {
    url: process.env.API_Domain+'/api/v1/user/contact',
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
      if(response.statusCode !== 200){
        // flash?
        console.log(response);
        return res.redirect('/test/kontakt');
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
