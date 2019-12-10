// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/admin/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const AdminRouter = express.Router();

const login = require('./login');
const user = require('./user');
const {adminAuthorization} = require('../../../../helper/authorization/middleware');


AdminRouter.route('/signup')
    .post(login.postRegister);

AdminRouter.route('/signin')
    .post(login.postLogin);

AdminRouter.route('/user')
    .get(user.getAllUser);

AdminRouter.route('/user/:userId')
    .get(adminAuthorization, user.getOneUser);

module.exports = AdminRouter;
