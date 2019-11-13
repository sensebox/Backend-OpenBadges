// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

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
  date: {
    type: Date,
    required: true
  }
});


module.exports = mongoose.model('User', UserSchema);
