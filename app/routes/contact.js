// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken} = require('../helper/middleware/refreshToken');


router.get('/', refreshToken, function (req, res){
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
          // error: no user signed in
          return res.render('Kontaktformular', {
            title: 'Kontakt'
          });
        }
        res.render('Kontaktformular', {
          title: 'Kontakt',
          email: JSON.parse(body).user.email,
          me: req.me
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


// everybody can contact the support, no authentification needed.
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
