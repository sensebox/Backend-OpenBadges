// jshint esversion: 8
// jshint node: true
"use strict";

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../../models/user');
const TokenBlacklist = require('../../models/tokenBlacklist');
const isTokenInvalid = require('./jwt');


const userAuthorization = async function(req, res, next){
  // get JWT from authorization-header
  const rawAuthorizationHeader = req.header('authorization');
  var token;
  if(rawAuthorizationHeader){
    [, token] = rawAuthorizationHeader.split(' ');
  }
  try {
    if(token){
      var decoded = jwt.verify(token, process.env.JWT_Token_Secret);
      var invalid = await TokenBlacklist.findOne({token: token});
      if(!invalid){
         User.findById(decoded.id).then(user => {
           if(user){
             req.user = {};
             req.user.id = user.id;
             req.user.username = user.username;
             return next();
           }
           else {
             // user does not exist
             return res.status(401).send({
               message: 'You\'re unauthorized'
             });
           }
        })
        .catch(err => {
          return res.status(401).send({
            message: 'You\'re unauthorized'
          });
        });
      }
      else {
        // Token is blacklisted -> invalid
        return res.status(401).send({
          message: 'You\'re unauthorized'
        });
      }
    }
    // authorization-header does not exist
    else {
      return res.status(401).send({
        message: 'You\'re unauthorized'
      });
    }
  }
  catch(err) {
    return res.status(401).send({
      message: 'You\'re unauthorized'
    });
  }
};

module.exports = {
  userAuthorization
};
