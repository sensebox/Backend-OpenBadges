// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/domain/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const DomainRouter = express.Router();

const {originAuthorization} = require('../../../../helper/authorization/middleware');

const badge = require('./badge');


DomainRouter.route('/badge')
    .get(originAuthorization, badge.getBadges);

DomainRouter.route('/badge/:badgeId/assigne/user/:userId')
    .put(originAuthorization, badge.assigneBadge);

DomainRouter.route('/user/:userId')
    .get(originAuthorization, badge.getOneUser);


module.exports = DomainRouter;
