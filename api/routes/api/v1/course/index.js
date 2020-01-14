// jshint esversion: 6
// jshint node: true
"use strict";

/**
* routes/api/v1/course/index.js
* @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
*/

const express = require('express');
const CourseRouter = express.Router();
const user = require('./user');
const {userAuthorization} = require('../../../../helper/authorization/middleware');


CourseRouter.route('/')
    .post(userAuthorization, require('./course').postCourse);

CourseRouter.route('/')
    .get(require('./course').getCourses);

CourseRouter.route('/me')
    .get(userAuthorization, require('./course').getMyCourses);

CourseRouter.route('/:courseId')
    .get(require('./course').getCourseID);

CourseRouter.route('/:courseId/participants')
    .get(userAuthorization, require('./course').getParticipants);

CourseRouter.route('/:courseId/deactivation')
    .put(userAuthorization, require('./course').putCourseHidden);

CourseRouter.route('/:courseId/user/registration')
    .put(userAuthorization, user.putCourseSignIn);

CourseRouter.route('/:courseId/user/deregistration')
    .put(userAuthorization, user.putCourseSignOut);

CourseRouter.route('/:courseId')
    .put(userAuthorization, require('./course').putCourse);


module.exports = CourseRouter;
