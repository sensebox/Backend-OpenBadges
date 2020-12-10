// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');
const moment = require('moment');


//simple schema
const MultipleUserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    default: 'Max'
  },
  lastname: {
    type: String,
    required: true,
    default: 'Mustermann'
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
    enum: ['earner', 'issuer', 'teacher', 'admin'],
    default: 'earner'
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpiresIn: {
    type: Date
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
  },
  badge: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }]
});


module.exports = mongoose.model('MultipleUser', MultipleUserSchema);
