// jshint esversion: 8
// jshint node: true
"use strict";

const multer = require('multer');
const fs = require('fs');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './upload');
    },
    filename: (req, file, cb) => {
      cb(null, `${req.user.id}_${Date.now()}_${file.originalname}`);
    }
});
var upload = multer({
  storage: storage
});

module.exports = {
  upload
};
