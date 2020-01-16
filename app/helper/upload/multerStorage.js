// jshint esversion: 6
// jshint node: true
"use strict";

const multer = require('multer');

var storage = multer.diskStorage({
  // // saves each image in the folder 'public/images/uploads' // TODO: necessary??
  //   destination: (req, file, cb) => {
  //     cb(null, 'public/images/uploads');
  //   },
  // saves the image in local temp folder
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now());
  }
});


var upload = multer({
  storage: storage,
  limits: {fileSize: 5000000}, // maximum fileSize: 5MB
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb('Falsches Dateiformat: Es werden .jpg, .jpeg und .png Dateien unterstützt.');
    }
    cb(null, true);
  }
});


module.exports = {
  upload
};
