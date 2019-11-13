// jshint esversion: 8
// jshint node: true
"use strict";

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const Picture = require('../models/picture');


router.get('/', function(req, res) {
  res.render('picture', {
    title: 'Upload Badge',
  });
});


var storage = multer.diskStorage({
  // saves each image in the folder 'public/images/uploads' // TODO: necessary??
    destination: (req, file, cb) => {
      cb(null, 'public/images/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now());
    }
});
var upload = multer({storage: storage, limits: {fileSize: 5000000}}); // maximum fileSize: 5MB

// TODO: only allow images to be uploaded
router.post('/upload', (req, res) => {
  // upload.single('name of form in HTML')
  upload.single('picture_recept')(req, res, (async err => {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            // 'File too large'
            return res.send('Datei zu groß');
        } else {
            return res.send('Error');
        }
    } else {
      if(req.file == null){
        return res.send('Kein Bild übergeben');
      }
      else {
        var newImg = fs.readFileSync(req.file.path, 'base64');
        var newPic = new Picture({
          description: req.body.description,
          contentType: req.file.mimetype,
          size: req.file.size,
          img: new Buffer.from(newImg, 'base64')
        });
        const savedPic = await newPic.save();
        return res.redirect('/picture/'+savedPic._id);
      }
    }
  }));
});


router.get('/:pictureId', async (req, res) => {
  var id = req.params.pictureId;
  const picture = await Picture.findById(id);

  res.setHeader('content-type', picture.contentType);
  res.send(picture.img);

  // to pass a string which is recognized as an image in the <img> tag, the following must be added:
  // const picBase64 = 'data:'+picture.contentType+';base64,'+base64ArrayBuffer(picture.img.buffer);
  // res.render('picture/picture', {
  //   title: 'Bild',
  //   picture: picBase64
  // });
});


// @see https://gist.github.com/jonleighton/958841
function base64ArrayBuffer(arrayBuffer) {
  var base64    = '';
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  var bytes         = new Uint8Array(arrayBuffer);
  var byteLength    = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength    = byteLength - byteRemainder;

  var a, b, c, d;
  var chunk;

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63;               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }

  return base64;
}


module.exports = router;
