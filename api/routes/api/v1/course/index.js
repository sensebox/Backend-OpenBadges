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
    .get(require('./course').getCourse);

CourseRouter.route('/:courseId/user/signin')
    .put(userAuthorization, user.putCourseSignIn);

CourseRouter.route('/:courseId/user/signout')
    .put(userAuthorization, user.putCourseSignOut);





module.exports = CourseRouter;
