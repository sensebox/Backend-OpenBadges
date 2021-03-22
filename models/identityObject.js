// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require("mongoose");

//simple schema
const IdentityObjectSchema = new mongoose.Schema({
  identity: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "email"
  },
  hashed: {
    type: Boolean,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("IdentityObject", IdentityObjectSchema);
