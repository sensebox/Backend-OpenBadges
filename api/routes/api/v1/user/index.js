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

UserRouter.route('/signup')
    .post(require('./users').postRegister);

UserRouter.route('/signin')
    .post(require('./users').postLogin);

UserRouter.route('/refreshToken')
    .post(require('./users').postRefreshToken);

UserRouter.route('/signout')
    .post(passport.authenticate('jwt', {session: false}), require('./users').postLogout);

UserRouter.route('/secret')
    .get(passport.authenticate('jwt', {session: false}), require('./secret').getSecret);


module.exports = UserRouter;
