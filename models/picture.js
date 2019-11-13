// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

// schema for user
const pictureSchema = mongoose.Schema({
  description: {
    type: String,
    default: 'Das ist eine Beschreibung',
  },
  contentType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  img: {
    type: Buffer,
    required: true
  }
});

module.exports = mongoose.model('Picture', pictureSchema);
