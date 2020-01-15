// jshint esversion: 6
// jshint node: true
"use strict";


const request = require('request');


const cookieExtractor = function(req, cookieName) {
  var token = null;
  if (req && req.cookies){
    // jwt-token stored in cookie "access"
    token = req.cookies[cookieName];
  }
  return token;
};


const refreshToken = function(req, res, next){
  var token = cookieExtractor(req, 'refresh');
  var url = process.env.API_Domain+'/api/v1/user/token/refresh';
  request.post(url, {form: {refreshToken: token}})
  .on('response', function(response) {
    // concatenate updates from datastream
    var body = '';
    response.on('data', function(chunk){
      //console.log("chunk: " + chunk);
      body += chunk;
    });
    response.on('end', function(){
      if(response.statusCode !== 200){
        req.authorized = false;
        req.token = undefined;
        req.me = undefined;
        next();
      }
      else {
        // token is generated
        // set cookies (name: "access" and "refresh") with token as content
        const cookieOptions = {
          httpOnly: true, // the cookie only accessible by the web server
        };
        res.cookie('access', JSON.parse(body).token, cookieOptions);
        cookieOptions.maxAge = process.env.COOKIE_MaxAge;
        res.cookie('refresh', JSON.parse(body).refreshToken, cookieOptions);
        console.log('Token refreshed');
        req.authorized = true;
        req.token = JSON.parse(body).token;
        req.me = JSON.parse(body).user;
        next();
      }
    });
  })
  .on('error', function(err) {
    console.log(err);
    req.authorized = false;
    req.token = undefined;
    req.me = undefined;
    next();
  });
};


module.exports = {
  refreshToken
};
