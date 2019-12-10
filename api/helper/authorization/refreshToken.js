// jshint esversion: 6
// jshint node: true
"use strict";


const crypto = require('crypto');

// @see: https://github.com/sensebox/openSenseMap-API/blob/461777e52f8568a6f234945fbae083688a7edb59/packages/api/lib/helpers/jwtRefreshTokenHasher.js
const hashJWT = function (jwtString) {
  if (typeof jwtString !== 'string') {
    throw new Error('method hashJWT expects a string parameter');
  }
  return crypto
    .createHmac('sha512', process.env.Refresh_Token_Secret)
    .update(jwtString)
    .digest('base64');
};

module.exports = {
  hashJWT
};
