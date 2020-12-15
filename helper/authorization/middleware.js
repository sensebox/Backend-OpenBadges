// jshint esversion: 8
// jshint node: true
"use strict";

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../../models/user');
const Domain = require('../../models/domain');
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
             req.user.initials = user.firstname.charAt(0).toUpperCase()+user.lastname.charAt(0).toUpperCase();
             req.user.role = user.role;
             return next();
           }
           else {
             // user does not exist
             return res.status(401).send({
               message: 'Unauthorized'
             });
           }
        })
        .catch(err => {
          return res.status(401).send({
            message: 'Unauthorized'
          });
        });
      }
      else {
        // Token is blacklisted -> invalid
        return res.status(401).send({
          message: 'Unauthorized'
        });
      }
    }
    // authorization-header does not exist
    else {
      return res.status(401).send({
        message: 'Unauthorized'
      });
    }
  }
  catch(err) {
    return res.status(401).send({
      message: 'Unauthorized'
    });
  }
};


const adminAuthorization = async function(req, res, next){
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
         User.findOne({_id: decoded.id, role: 'admin'}).then(user => {
           if(user){
             req.user = {};
             req.user.id = user.id;
             req.user.username = user.username;
             req.user.role = user.role;
             return next();
           }
           else {
             // user does not exist
             return res.status(401).send({
               message: 'Unauthorized'
             });
           }
        })
        .catch(err => {
          return res.status(401).send({
            message: 'Unauthorized'
          });
        });
      }
      else {
        // Token is blacklisted -> invalid
        return res.status(401).send({
          message: 'Unauthorized'
        });
      }
    }
    // authorization-header does not exist
    else {
      return res.status(401).send({
        message: 'Unauthorized'
      });
    }
  }
  catch(err) {
    return res.status(401).send({
      message: 'Unauthorized'
    });
  }
};

const originAuthorization = async function(req, res, next){
  try{
    // get JWT from authorization-header
    const rawAuthorizationHeader = req.header('authorization');
    var token;
    if(rawAuthorizationHeader){
      [, token] = rawAuthorizationHeader.split(' ');
    }
    var decoded = jwt.verify(token, process.env.JWT_Token_Secret);
    var domain = await Domain.findOne({_id: decoded.id});
    if(domain){
      next();
    }
    else {
      return res.status(401).send({message:'Unauthorized'});
    }
  }
  catch(err){
    return res.status(401).send({message:'Unauthorized'});
  }
};

module.exports = {
  userAuthorization,
  adminAuthorization,
  originAuthorization
};
