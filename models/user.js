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
  birthday: {
    type: Date,
    required: true
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
  city: {
    type: String,
    required: true
  },
  postalcode: {
    type: String,
    required: true
  },
  image: {
    path: {
      type: String
    },
    size: {
      type: Number
    },
    contentType: {
      type: String
    },
    originalName: {
      type: String
    }
  },
  role: {
    type: [String],
    required: true,
    enum: ['earner', 'issuer', 'admin'],
    default: 'earner'
  },
  emailConfirmationToken: {
    type: String
  },
  emailIsConfirmed: {
    type: Boolean,
    required: true,
    default: false
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


module.exports = mongoose.model('User', UserSchema);
