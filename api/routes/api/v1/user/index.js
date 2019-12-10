// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/dwd/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const UserRouter = express.Router();

const login = require('./login');
const authorization = require('./authorization');
const {userAuthorization} = require('../../../../helper/authorization/middleware');


UserRouter.route('/signup')
    .post(login.postRegister);

UserRouter.route('/signin')
    .post(login.postLogin);

UserRouter.route('/password/request')
    .post(login.requestResetPassword);

UserRouter.route('/password/reset')
    .post(login.setResetPassword);

UserRouter.route('/signout')
    .post(userAuthorization, login.postLogout);

UserRouter.route('/token/refresh')
    .post(authorization.postRefreshToken);

UserRouter.route('/secret')
    .get(userAuthorization, require('./secret').getSecret);


module.exports = UserRouter;
