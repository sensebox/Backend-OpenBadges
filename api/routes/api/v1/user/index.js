// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/user/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const UserRouter = express.Router();

const login = require('./login');
const authorization = require('./authorization');
const user = require('./user');
const contact = require('./contact');
const {userAuthorization} = require('../../../../helper/authorization/middleware');
const {upload} = require('../../../../helper/imageUpload');


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

UserRouter.route('/me')
    .get(userAuthorization, user.getMe);

UserRouter.route('/me')
    .put(userAuthorization, upload.single('profile'), user.putMe);

UserRouter.route('/me')
    .delete(userAuthorization, user.deleteMe);

UserRouter.route('/email/:emailToken')
    .post(login.confirmEmail);

UserRouter.route('/contact')
    .post(contact.contact);


// TODO
UserRouter.route('/secret')
    .get(userAuthorization, require('./secret').getSecret);


module.exports = UserRouter;
