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
  console.log('token', req.cookies[cookieName]);
  return token;
};



// if(body){
//   // token is generated
//   // set cookies (name: "access" and "refresh") with token as content
//   const cookieOptions = {
//     httpOnly: true, // the cookie only accessible by the web server
//   };
//   res.cookie('access', (JSON.parse(body)).token, cookieOptions);
//   res.cookie('refresh', (JSON.parse(body)).refreshToken, cookieOptions);
// }


const accessSecret = function(req, res){
  console.log('accessSecret 1');
  var token = cookieExtractor(req, 'access');
  var options = {
    url: 'http://localhost:3000/api/v1/user/secret',
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
          console.log('refreshToken');
          var token = cookieExtractor(req, 'refresh');
          var url = 'http://localhost:3000/api/v1/user/refreshToken';
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
                  return res.redirect('/user/login');
              }
              // // token is generated

              console.log('accessSecret');
              var token = JSON.parse(body).token;
              var refreshToken = JSON.parse(body).refreshToken; //cookieExtractor(req, 'access');
              var options = {
                url: 'http://localhost:3000/api/v1/user/secret',
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
                    console.log(1);
                    return res.status(400).send('Fehlermeldung: '+ body);
                  }
                  // set cookies (name: "access" and "refresh") with token as content
                  const cookieOptions = {
                    httpOnly: true, // the cookie only accessible by the web server
                  };
                  // res.cookie('access', token, cookieOptions);
                  // res.cookie('refresh', refreshToken, cookieOptions);
                  return res.render('index', {
                    title: 'my secret'
                  });
                });
              })
              .on('error', function(err) {
                return res.status(400).send("Error");
              });
            });
          })
          .on('error', function(err) {
            return res.status(400).send("Error");
          });
          console.log(1);
          return res.status(400).send('Fehlermeldung: '+ body);
      }
      res.render('index', {
        title: 'my secret'
      });
    });
  })
  .on('error', function(err) {
    return res.status(400).send("Error");
  });
};



const refreshToken = function(req, res, cb){
  console.log('refreshToken');
  var token = cookieExtractor(req, 'refresh');
  var url = 'http://localhost:3000/api/v1/user/refreshToken';
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
        console.log('/user/login');
          // return res.redirect('/user/login');
      }
      console.log('accessSecret');
      var token = cookieExtractor(req, 'access');
      var options = {
        url: 'http://localhost:3000/api/v1/user/secret',
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
            if(cb){
              cb();
            }
            else {
              console.log(1);
              return res.status(400).send('Fehlermeldung: '+ body);
            }
          }
          res.render('index', {
            title: 'my secret'
          });
        });
      })
      .on('error', function(err) {
        return res.status(400).send("Error");
      });
    });
  })
  .on('error', function(err) {
    return res.status(400).send("Error");
  });
};

module.exports = {
  accessSecret,
  refreshToken,
  cookieExtractor
};
