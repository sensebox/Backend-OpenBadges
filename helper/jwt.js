// jshint esversion: 8
// jshint node: true
"use strict";


const TokenBlacklist = require('../models/tokenBlacklist');

const invalidateJWT = async function(token){
    var newBlacklistedToken = new TokenBlacklist({
        token: token
    });
    await newBlacklistedToken.save();
};

const isTokenInvalid = async function(token){
    var invalid = await TokenBlacklist.findOne({token: token});
    console.log('invalid', invalid);
    if(invalid) {
      console.log(true);
      return true;
    }
    else {
      return false;
    }
};

module.exports.invalidateJWT = invalidateJWT;
module.exports.isTokenInvalid = isTokenInvalid;
