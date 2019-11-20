// jshint esversion: 6
// jshint node: true
"use strict";

/**
*   routes/api/index.js
*   @description: index file for the API sub-application. All routes with '/api' come through here.
*   @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const APIRouter = express.Router();

// Put route handels here;
APIRouter.use('/v1', require('./v1'));
// APIRouter.use('/v2', require('./v2')); // possible api-version 2

module.exports = APIRouter;
