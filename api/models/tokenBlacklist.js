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
    default: moment.utc().add(Number(process.env.Token_Blacklist_ExpiresIn), 'ms').toDate(),
    expires: Number(process.env.Token_Blacklist_ExpiresIn)/1000
  }
});


module.exports = mongoose.model('TokenBlacklist', TokenBlacklistSchema);
