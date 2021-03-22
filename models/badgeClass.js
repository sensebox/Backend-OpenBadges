// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require("mongoose");

//simple schema
const badgeClassSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: "BadgeClass",
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  criteria: {
    type: String,
    required: true,
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  alignment: {
    type: String,
  },
  tags: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("BadgeClass", badgeClassSchema);
