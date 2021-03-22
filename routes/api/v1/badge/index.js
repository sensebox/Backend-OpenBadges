// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/badge/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const BadgeRouter = express.Router();

const {userAuthorization} = require('../../../../helper/authorization/middleware');
const {upload} = require('../../../../helper/imageUpload');


BadgeRouter.route('/')
    .post(userAuthorization, upload.single('image'), require('./badge').postBadge);

BadgeRouter.route('/')
    .get(require('./badge').getBadges);

BadgeRouter.route('/me')
    .get(userAuthorization, require('./badge').getBadgesMe);

BadgeRouter.route('/:badgeId.json')
    .get(require('./badge').getBadgeJSON);

BadgeRouter.route('/:badgeId')
    .get(require('./badge').getBadge);

BadgeRouter.route('/:badgeId')
    .put(userAuthorization, upload.single('image'), require('./badge').putBadge);

BadgeRouter.route('/:badgeId/deactivation')
    .put(userAuthorization, require('./badge').putBadgeHidden);

BadgeRouter.route('/:badgeId/project/:projectId/assigne/user/:userId')
    .put(userAuthorization, require('./user').assigneProjectBadge);

BadgeRouter.route('/:badgeId/project/:projectId/unassigne/user/:userId')
    .put(userAuthorization, require('./user').unassigneProjectBadge);

BadgeRouter.route('/:badgeId/assigne/user/:userId')
    .put(userAuthorization, require('./user').assigneBadge);

BadgeRouter.route('/:badgeId/unassigne/user/:userId')
    .put(userAuthorization, require('./user').unassigneBadge);

BadgeRouter.route('/project/:projectId/assigne')
    .put(userAuthorization, require('./user').assigneMultipleBadges);

BadgeRouter.route('/:badgeId/grant/:userId')
    .put(userAuthorization, require('./user').grantPermissionAssignBadge);

BadgeRouter.route('/:badgeId/revoke/:userId')
    .put(userAuthorization, require('./user').revokePermissionAssignBadge);

BadgeRouter.route('/:badgeId/request')
    .put(userAuthorization, require('./user').requestPermissionAssignBadge);

BadgeRouter.route('/:badgeId/issuer/:userId')
    .put(userAuthorization, require('./user').nominateIssuerBadge);

module.exports = BadgeRouter;
