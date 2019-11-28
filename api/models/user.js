// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');
const moment = require('moment');


//simple schema
const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: [String],
    required: true,
    enum: ['earner', 'issuer', 'admin'],
    default: ['earner']
  },
  refreshToken: {
    type: String,
  },
  refreshTokenExpiresIn: {
    type: Date
  },
  date: {
    type: Date,
    required: true,
    default: moment.utc().toDate()
  }
});


module.exports = mongoose.model('User', UserSchema);
