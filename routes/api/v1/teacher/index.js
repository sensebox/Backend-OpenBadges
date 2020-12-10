// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/user/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const TeacherRouter = express.Router();

const user = require('./user');
const {teacherAuthorization} = require('../../../../helper/authorization/middleware');

TeacherRouter.route('/users')
    .post(teacherAuthorization, user.postUsersRegister);

module.exports = TeacherRouter;
