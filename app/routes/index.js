// jshint esversion: 6
// jshint node: true
"use strict";

var express = require('express');
var router = express.Router();
const request = require('request');

const {refreshToken, cookieExtractor} = require('../helper/refreshToken_Client');

/* GET home (Secret) page. */
router.get('/', function(req, res){
  var token = cookieExtractor(req, 'access');
  var options = {
    url: process.env.API_Domain+'/api/v1/user/secret',
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
        return refreshToken(req, res, '/');
      }
      console.log(body);
      res.render('index', {
        title: 'my secret',
        user: JSON.parse(body).me
      });
    });
  })
  .on('error', function(err) {
    return res.status(400).send("Error");
  });
});

module.exports = router;
