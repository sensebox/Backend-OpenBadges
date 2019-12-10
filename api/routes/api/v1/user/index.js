// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/dwd/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const UserRouter = express.Router();

const user = require('./users');
const {userAuthorization} = require('../../../../helper/authorization/middleware');


UserRouter.route('/signup')
    .post(user.postRegister);

UserRouter.route('/signin')
    .post(user.postLogin);

UserRouter.route('/refreshToken')
    .post(user.postRefreshToken);

UserRouter.route('/requestResetPassword')
    .post(user.requestResetPassword);

UserRouter.route('/resetPassword')
    .post(user.setResetPassword);

UserRouter.route('/signout')
    .post(userAuthorization, user.postLogout);

UserRouter.route('/secret')
    .get(userAuthorization, require('./secret').getSecret);


module.exports = UserRouter;
