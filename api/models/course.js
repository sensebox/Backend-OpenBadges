// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

//simple schema
const CourseSchema = new mongoose.Schema({
  // Kurs name
  name: {
    type: String,
    required: true,
  },
  badge: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  localbadge: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  // Nutzername der den Kurs erstellt
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Falls der Nutzer es für eine organisation etc anbietet (zb. Kreativwerkstatt Münster)
  courseprovider: {
    type: String,
    required: true
  },
  // PLZ wird benötigt
  postalcode: {
    type: String
  },
  // Adresse wird benötigt
  address: {
    type: String
  },
  // wird vom user mitgeliefert --> osm nominatim
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  },
  // das übergeordnete Thema des Kurses
  topic:{
    type: String,
    required: true
  },
  // Eine Beschreibung des Kurses (z.b. Inhalte)
  description:{
    type: String,
    required: true
  },
  // mögliche Kenntnisse die man bringen sollen
  requirements:{
    type: String
  },
  // zeitraum des Kurses
  startdate: {
    type: Date
  },
  enddate: {
    type: Date
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User'
  },
  size: {
    type: Number,
    required: true,
  },
  // ist der Kurs aktuell, bei Nein soll er nicht mehr gesehen werden
  exists: {
    type: Boolean,
    default: true
  }
});


module.exports = mongoose.model('Course', CourseSchema);
