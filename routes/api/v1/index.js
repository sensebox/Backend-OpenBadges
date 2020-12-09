// jshint esversion: 6
// jshint node: true
"use strict";

/**
*  routes/api/v1/index.js
*  @description: index file for the v1 sub-application. All routes with '/v1' come through here.
*  @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const V1Router = express.Router();

// Put route handels here;
V1Router.use('/user', require('./user'));
V1Router.use('/admin', require('./admin'));
V1Router.use('/project', require('./project'));
V1Router.use('/badge', require('./badge'));
V1Router.use('/domain', require('./domain'));

module.exports = V1Router;
