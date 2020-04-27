// jshint esversion: 6
// jshint node: true
"use strict";

const mongoose = require('mongoose');

//simple schema
const CourseSchema = new mongoose.Schema({
  // Kurs name
  name: {
    type: String,
    required: true
  },
  badge: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  }],
  localbadge: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  }],
  // Nutzername der den Kurs erstellt
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    type: String,
    required: true
  },
  // zeitraum des Kurses
  // muss nicht angegeben werden da es auch ein Online Kurs sein kann
  startdate: {
    type: Date,
    required: true
  },
  enddate: {
    type: Date,
    required: true
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
