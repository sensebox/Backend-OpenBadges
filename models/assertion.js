// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require("mongoose");

//simple schema
const AssertionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    default: "Assertion"
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BadgeClass",
    required: true,
  },
  verification: {
    type: String,
    required: true,
  },
  issuedOn: {
    type: Date,
    required: true,
    default: Date.now(),
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
  evidence: {
    type: String,
  },
  narrative: {
    type: String,
  },
  expires: {
    type: Date,
  },
  revoked: {
    type: Boolean,
  },
  revocationReason: {
      type: String
  }
});

module.exports = mongoose.model("Assertion", AssertionSchema);
