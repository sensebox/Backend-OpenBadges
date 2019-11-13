// jshint esversion: 8
// jshint node: true
"use strict";

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const mongoose = require('mongoose');
const User = require('../models/user');
const TokenBlacklist = require('../models/tokenBlacklist');
const isTokenInvalid = require('../helper/jwt');


// this sets how we handle tokens coming from the requests that come
// and also defines the key to be used when verifying the token
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //cookieExtractor,
    secretOrKey: process.env.JWT_Token,
    passReqToCallback: true
};

module.exports = function(passport){
  passport.use(
    new JwtStrategy(opts, async (req, payload, done) => {
      const rawAuthorizationHeader = req.header('authorization');
      const [, token] = rawAuthorizationHeader.split(' ');
      console.log(token);

      var invalid = await TokenBlacklist.findOne({token: token});
      if(!invalid){
         User.findById(payload.id).then(user => {
           if(user){
             return done(null, {
                 id: user.id,
                 username: user.username,
             });
           }
           else {
             return done(null, false);
           }
          })
        .catch(err => {
            console.error(err);
            return done(null, false);
          });
      }
      else {
        // Token is blacklisted -> invalid
        return done(null, false);
      }
    })
  );
};


// var cookieExtractor = function(req) {
//   var token = null;
//   if (req && req.cookies){
//     // jwt-token stored in cookie "access"
//     token = process.env.JWT_Header_Token +  req.cookies.access;
//   }
//   return token;
// };
