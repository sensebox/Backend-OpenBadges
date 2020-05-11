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
const badge = require('./badge');
const course = require('./course');
const {adminAuthorization} = require('../../../../helper/authorization/middleware');
const {upload} = require('../../../../helper/imageUpload');



AdminRouter.route('/signup')
    .post(adminAuthorization, upload.single('profile'), login.postRegister);

AdminRouter.route('/signin')
    .post(login.postLogin);


AdminRouter.route('/user')
    .get(adminAuthorization, user.getAllUser);

AdminRouter.route('/user/:userId')
    .get(adminAuthorization, user.getOneUser);


AdminRouter.route('/badge')
    .get(adminAuthorization, badge.getBadges);

AdminRouter.route('/badge')
    .post(adminAuthorization, upload.single('image'), badge.postGlobalBadge);

AdminRouter.route('/badge')
    .put(adminAuthorization, upload.single('image'), badge.putBadge);

AdminRouter.route('/badge/:badgeId/course/:courseId/assigne/user/:userId')
    .put(adminAuthorization, badge.assigneBadge);

AdminRouter.route('/badge/:badgeId/course/:courseId/unassigne/user/:userId')
    .put(adminAuthorization, badge.unassigneBadge);


AdminRouter.route('/course/:courseId/participants')
    .get(adminAuthorization, course.getParticipants);


module.exports = AdminRouter;
