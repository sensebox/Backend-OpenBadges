// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/dwd/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const BadgeRouter = express.Router();

BadgeRouter.route('/local')
    .post(require('./badge').postBadge);

BadgeRouter.route('/')
    .get(require('./badge').getBadge);

<<<<<<< HEAD
BadgeRouter.route('/global')
    .put(require('./badge').putBadgeGlobal);

BadgeRouter.route('/local')
    .put(require('./badge').putBadgeLocal);

BadgeRouter.route('/global')
    .post(require('./badge').postBadgeGlobal);
=======
BadgeRouter.route('/assigne/:badgeId/:userId/')
    .put(require('./user').assigneBadge);



>>>>>>> User


module.exports = BadgeRouter;
