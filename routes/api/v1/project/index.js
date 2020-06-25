// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/project/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const ProjectRouter = express.Router();
const user = require('./user');
const {userAuthorization} = require('../../../../helper/authorization/middleware');
const {upload} = require('../../../../helper/imageUpload');


ProjectRouter.route('/')
    .post(userAuthorization, upload.single('image'), require('./project').postProject);

ProjectRouter.route('/')
    .get(require('./project').getProjects);

ProjectRouter.route('/me')
    .get(userAuthorization, require('./project').getMyProjects);

ProjectRouter.route('/creator/me')
    .get(userAuthorization, require('./project').getMyCreatedProjects);

ProjectRouter.route('/:projectId')
    .get(require('./project').getProjectID);

ProjectRouter.route('/:projectId/participants')
    .get(userAuthorization, require('./project').getParticipants);

ProjectRouter.route('/:projectId/deactivation')
    .put(userAuthorization, require('./project').putProjectHidden);

ProjectRouter.route('/:projectId/user/registration')
    .put(userAuthorization, user.putProjectSignIn);

ProjectRouter.route('/:projectId/user/deregistration')
    .put(userAuthorization, user.putProjectSignOut);

ProjectRouter.route('/:projectId')
    .put(userAuthorization, upload.single('image'), require('./project').putProject);


module.exports = ProjectRouter;
