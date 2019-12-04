// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

//simple schema
const BadgeSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  criteria: Array
});


module.exports = mongoose.model('Badge', BadgeSchema);
