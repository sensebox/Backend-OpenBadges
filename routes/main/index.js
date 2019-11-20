// jshint esversion: 6
// jshint node: true
"use strict";

/**
*   routes/main/index.js
*   @description: index file for the main sub-application. All routes with '/' come through here.
*   @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const MainRouter = express.Router();
const passport = require('passport');

MainRouter.route('/')
    .get(require('./main').getMainPage);

MainRouter.route('/user/login')
    .get(require('./users').getLogin)
    .post(require('./users').postLogin);

MainRouter.route('/user/register')
    .get(require('./users').getRegister)
    .post(require('./users').postRegister);

MainRouter.route('/secret')
    .get(require('./users').getSecret);

module.exports = MainRouter;
