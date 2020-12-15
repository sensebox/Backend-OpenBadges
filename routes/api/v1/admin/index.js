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
const project = require('./project');
const domain = require('./domain');
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
    .put(adminAuthorization, upload.single('image'), badge.putBadge);

AdminRouter.route('/badge/:badgeId/project/:projectId/assigne/user/:userId')
    .put(adminAuthorization, badge.assigneProjectBadge);

AdminRouter.route('/badge/:badgeId/project/:projectId/unassigne/user/:userId')
    .put(adminAuthorization, badge.unassigneProjectBadge);

AdminRouter.route('/project/:projectId/participants')
    .get(adminAuthorization, project.getParticipants);

AdminRouter.route('/domain')
    .post(adminAuthorization, domain.postDomain);

AdminRouter.route('/domain')
    .get(adminAuthorization, domain.getDomains);

AdminRouter.route('/domain/:domainId')
    .delete(adminAuthorization, domain.deleteDomain);


module.exports = AdminRouter;
