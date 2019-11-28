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


const refreshToken = function(req, res, redirectUrl){
  var token = cookieExtractor(req, 'refresh');
  var url = process.env.API_Domain+'/api/v1/user/refreshToken';
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
        console.log('directed to Login');
        return res.redirect('user/login');
      }
      else {
        // token is generated
        // set cookies (name: "access" and "refresh") with token as content
        const cookieOptions = {
          httpOnly: true, // the cookie only accessible by the web server
        };
        res.cookie('access', (JSON.parse(body)).token, cookieOptions);
        cookieOptions.maxAge = process.env.COOKIE_MaxAge;
        res.cookie('refresh', (JSON.parse(body)).refreshToken, cookieOptions);
        console.log('Token refreshed');
        return res.redirect(redirectUrl);
      }
    });
  })
  .on('error', function(err) {
    return res.status(400).send("Error");
  });
};

module.exports = {
  refreshToken,
  cookieExtractor
};
