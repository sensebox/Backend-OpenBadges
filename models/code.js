// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');
const moment = require('moment');

//simple schema
const CodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true
  },
  badge: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  }],
  date: {
    type: Date,
    required: true,
    default: moment.utc().add(Number(process.env.Code_ExpiresIn), 'ms').toDate(),
    expires: Number(process.env.Code_ExpiresIn)/1000
  }
});


module.exports = mongoose.model('Code', CodeSchema);
