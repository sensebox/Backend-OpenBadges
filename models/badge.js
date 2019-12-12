// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

//simple schema
const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true},
  description: {
    type: String},
  image: {
    type: String},
  criteria: {
    type: String},
  issuer: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});


module.exports = mongoose.model('Badge', BadgeSchema);
