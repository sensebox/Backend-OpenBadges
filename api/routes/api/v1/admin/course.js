// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const Course = require('../../../../models/course');
const User = require('../../../../models/user');


/**
 * @api {get} /api/v1/course/:courseId/participants Participants of one course
 * @apiName adminGetParticipants
 * @apiDescription Getting all participants of one course by ID
 * @apiGroup Admin
 *
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `Participants found successfully.`
 * @apiSuccess (Success 200) {Object} participants `[{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getParticipants = async function(req, res){
  try{
    var courseId = req.params.courseId;
    var course = await Course.findById(courseId);
    if(course){
      var participants = await User.find({_id: {$in: course.participants}}, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
      return res.status(200).send({
        message: 'Participants found successfully.',
        participants: participants
      });
    }
    else {
      return res.status(404).send({
        message: 'Course not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


module.exports = {
 getParticipants
};
