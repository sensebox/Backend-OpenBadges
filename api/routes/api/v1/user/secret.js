// jshint esversion: 6
// jshint node: true
"use strict";

var express = require('express');
var router = express.Router();

/* GET home page. */
const getSecret = function(req, res){
  console.log(req.user);
  // router.get('/', function(req, res, next) {
  res.status(200).send('secret accessed successfully!');
};

module.exports = {
  getSecret
};
