// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/dwd/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const UserRouter = express.Router();
const passport = require('passport');

UserRouter.route('/register')
    .post(require('./users').postRegister);

UserRouter.route('/login')
    .post(require('./users').postLogin);

UserRouter.route('/logout')
    .get(passport.authenticate('jwt', {session: false}), require('./users').getLogout);

UserRouter.route('/secret')
    .get(passport.authenticate('jwt', {session: false}), require('./secret').getSecret);


module.exports = UserRouter;
