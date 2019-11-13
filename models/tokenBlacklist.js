// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');
const moment = require('moment');

//simple schema
const TokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
    expires: '1h' // one hour/ '1m' is one minute
  }
});


module.exports = mongoose.model('TokenBlacklist', TokenBlacklistSchema);
