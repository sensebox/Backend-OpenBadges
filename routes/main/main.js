// jshint esversion: 6
// jshint node: true
"use strict";

var express = require('express');
var router = express.Router();

/* GET home page. */
const getMainPage = function(req, res){
// router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
};

module.exports = {
  getMainPage
};
