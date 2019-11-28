// jshint esversion: 6
// jshint node: true
"use strict";

const express = require('express');
const TestRouter = express.Router();

// Route to test the access of the API
TestRouter.get('/', function(req, res){
  res.status(200).send('API started');
});

module.exports = TestRouter;
