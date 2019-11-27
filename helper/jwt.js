// jshint esversion: 8
// jshint node: true
"use strict";


const TokenBlacklist = require('../models/tokenBlacklist');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const {hashJWT} = require('../helper/refreshToken');


const invalidateToken = async function(token){
    var newBlacklistedToken = new TokenBlacklist({
        token: token
    });
    await newBlacklistedToken.save();
};

const isTokenValid = async function(token){
    var valid = await TokenBlacklist.findOne({token: token});
    if(valid) {
      return false;
    }
    else {
      return true;
    }
};


// @see: https://github.com/sensebox/openSenseMap-API/blob/461777e52f8568a6f234945fbae083688a7edb59/packages/api/lib/helpers/jwtHelpers.js#L26
const createToken = function (user) {
  const payload = {id: user._id};
  const options = {expiresIn: Math.round(Number(process.env.JWT_expiresIn) / 1000)};

  return new Promise(function (resolve, reject) {
    jwt.sign(payload, process.env.JWT_Token_Secret, options, async (err, token) => {
      if (err) {
        return reject(err);
      }

      // JWT generation was successful
      // we now create the refreshToken.
      // and set the refreshTokenExpires to 1 week
      // it is a HMAC of the jwt string
      const refreshToken = hashJWT(token);
      try {
        console.log(Number(process.env.Refresh_Token_ExpiresIn));
        console.log(moment.utc()
          .add(Number(process.env.Refresh_Token_ExpiresIn), 'ms')
          .toDate());
        await user.update({
          $set: {
            refreshToken: refreshToken,
            refreshTokenExpiresIn: moment.utc()
              .add(Number(process.env.Refresh_Token_ExpiresIn), 'ms')
              .toDate()
          }
        }).exec();

        return resolve({token: token, refreshToken: refreshToken});
      } catch (err) {
        return reject(err);
      }
    });
  });
};


module.exports = {
  invalidateToken,
  isTokenValid,
  createToken
};
