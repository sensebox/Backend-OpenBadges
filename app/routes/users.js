// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');
const router = express.Router();
const request = require('request');

const {refreshToken, cookieExtractor} = require('../helper/refreshToken_Client');


router.get('/register', function (req, res){
  res.render('registrierung', {
    title: 'Registrieren'
  });
});


router.post('/register', function (req, res){
  var url = process.env.API_Domain+'/api/v1/user/register';
  request.post(url, {form: req.body})
    .on('response', function(response) {
      // concatenate updates from datastream
      var body = '';
      response.on('data', function(chunk){
          //console.log("chunk: " + chunk);
          body += chunk;
      });
      response.on('end', function(){
        if(response.statusCode !== 200){
          return res.status(400).send(JSON.parse(body));
        }
        res.redirect('/user/login');
      });
    })
    .on('error', function(err) {
      return res.status(400).send('Fehler');
  });
});


router.get('/login', async function (req, res){
  res.render('login', {
    title: 'Login'
  });
});


router.post('/login', function (req, res){
  var url = process.env.API_Domain+'/api/v1/user/login';
  request.post(url, {form: req.body})
    .on('response', function(response) {
      // concatenate updates from datastream
      var body = '';
      response.on('data', function(chunk){
          //console.log("chunk: " + chunk);
          body += chunk;
      });
      response.on('end', function(){
        if(response.statusCode !== 200){
          return res.status(400).send(JSON.parse(body));
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


router.get('/logout', function(req, res){
  var token = cookieExtractor(req, 'access');
  var options = {
    url: process.env.API_Domain+'/api/v1/user/logout',
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
          return refreshToken(req, res, '/user/logout');
        }
        res.clearCookie('access');
        res.clearCookie('refresh');
        res.redirect('/user/login');
      });
    })
    .on('error', function(err) {
      return res.status(400).send('Fehler');
  });
});



module.exports = router;
