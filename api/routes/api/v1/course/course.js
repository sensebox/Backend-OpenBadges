// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');

const Course = require('../../../../models/course');
const User = require('../../../../models/user');



/**
 * @api {post} /api/v1/course Create course
 * @apiName createCourse
 * @apiDescription Create a new Course.
 * @apiGroup Course
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} name name of the course
 * @apiParam {ObjectId-Array} badge the ObjectId of global badges for the course (min: 1); example: `["5e1b0bafeafe4a84c4ac31a9"]`
 * @apiParam {ObjectId-Array} localbadge the ObjectId of local badges for the Course (min: 1); example: `["5e1b0bafeafe4a84c4ac31a9"]`
 * @apiParam {String} courseprovider the provider of the course might be specified by the creator
 * @apiParam {String} postalcode postalcode of the building where the course take place
 * @apiParam {String} address adress of the location from the Course
 * @apiParam {Coordinates-Array} coordinates coordinates of the location from the Course; example: `[longitude, latitude]`
 * @apiParam {String} topic topic of the Course
 * @apiParam {String} description a brief summary about the course contents
 * @apiParam {String} requirements a brief summary about the course requirements
 * @apiParam {Date} startdate Date of the start of the course
 * @apiParam {Date} enddate Date of the end of the course
 * @apiParam {Number} size maximal amount of the course participants
 *
 * @apiSuccess (Created 201) {String} message `Course is successfully created.`
 * @apiSuccess (Created 201) {Object} course `{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}'
 *
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const postCourse = async function(req, res){
  try{
    const course = new Course({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      badge: JSON.parse(req.body.badge),
      localbadge: JSON.parse(req.body.localbadge),
      creator: req.user.id,
      courseprovider: req.body.courseprovider,
      postalcode: req.body.postalcode,
      address: req.body.address,
      'coordinates.coordinates': JSON.parse(req.body.coordinates),
      topic: req.body.topic,
      description: req.body.description,
      requirements: req.body.requirements,
      startdate: req.body.startdate,
      enddate: req.body.enddate,
      size: req.body.size
    });
    const savedCourse = await course.save();
    // updates the role to issuer, because the user issues a new course.
    if(req.user.role === 'earner'){
      await User.updateOne({_id: req.user.id}, {role: 'issuer'});
    }
    return res.status(201).send({
      message: 'Course is successfully created.',
      course: savedCourse
    });
  }
  catch(err) {
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/course Get courses
 * @apiName getCourses
 * @apiDescription Get all courses respectivly get courses by different parameters which exist.
 * @apiGroup Course
 *
 * @apiParam {String} [name] course name
 * @apiParam {Coordinates-Array} [coordinates] coordinates in which radius might be an course; example: `[longitude, latitude]`
 * @apiParam {Number} [radius] radius [in km] about a pair of coordinates
 * @apiParam {Date} [startdate] greater (or equal) than the startdate of the course
 * @apiParam {Date} [enddate] lower (or equal) than the enddate of the course
 * @apiParam {String} [topic] course topic
 *
 * @apiSuccess (Success 200) {String} message `Courses found successfully.`
 * @apiSuccess (Success 200) {Object} courses `[{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "Courses not found using the specified parameters."}`
 * @apiError (On error) {Object} 404 `{"message": "Courses not found."}`
 * @apiError (On error) {Object} 404 `{"message": "To filter courses in a certain radius, the parameters "coordinates" and "radius" are required."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getCourses = async function(req, res){
  try{
    var qname = req.query.name;
    var qcoordinates = req.query.coordinates;
    var qradius = req.query.radius;
    var qtopic = req.query.topic;
    var qstartdate = req.query.startdate;
    var qenddate = req.query.enddate;

    var query = {
      exists: true
    };
    if(qname){
      query.name = qname;
    }
    if(qtopic){
      query.topic = qtopic;
    }
    if(qstartdate){
      query.startdate = {$gte: qstartdate};
    }
    if(qenddate){
      query.enddate = {$lte: qenddate};
    }
    if(qcoordinates || qradius){
      if(qcoordinates && qradius){
        var coords = req.query.coordinates.split(",");
        query.coordinates = {$geoWithin: {$centerSphere: [JSON.parse(qcoordinates), qradius/6378.1]}};
      }
      else {
        return res.status(404).send({
          message: 'To filter courses in a certain radius, the parameters \'coordinates\' and \'radius\' are required.',
        });
      }
    }

    var result = await Course.find(query);
    if(result.length > 0){
      return res.status(200).send({
        message: 'Courses found successfully.',
        courses: result
      });
    }
    else {
      if(Object.keys(query).length > 0){
        return res.status(404).send({
          message: 'Courses not found using the specified parameters.',
        });
      }
      else {
        return res.status(404).send({
          message: 'Courses not found.',
        });
      }
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {get} /api/v1/course/:courseId Get course
 * @apiName getCourse
 * @apiDescription Get one course by course-id.
 * @apiGroup Course
 *
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Course found successfully.`
 * @apiSuccess (Success 200) {Object} course `{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}`
 *
 * @apiError (On error) {Object} 404 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getCourseID = async function(req, res){
  try{
    var course = await Course.findOne({_id: req.params.courseId})
                             .populate('creator', {firstname:1, lastname: 1})
                             .populate('badge')
                             .populate('localbadge');
    if(course){
      return res.status(200).send({
        message: 'Course found successfully.',
        course: course
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


/**
 * @api {get} /api/v1/course/me Get my courses
 * @apiName getmyCourses
 * @apiDescription Get (all) courses of currently signed in User by different queries.
 * @apiGroup Course
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} [name] course name
 * @apiParam {Coordinates-Array} [coordinates] coordinates in which radius might be an course; example: `[longitude, latitude]`
 * @apiParam {Number} [radius] radius [in km] about a pair of coordinates
 * @apiParam {Date} [startdate] greater (or equal) than the startdate of the course
 * @apiParam {Date} [enddate] lower (or equal) than the enddate of the course
 * @apiParam {String} [topic] course topic
 *
 * @apiSuccess (Success 200) {String} message `Courses found successfully.`
 * @apiSuccess (Success 200) {Object} courses `[{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}]`
 *
 * @apiError (On error) {Object} 400 `{"message": "No courses found using the specified parameters."}`
 * @apiError (On error) {Object} 404 `{"message": "To filter courses in a certain radius, the parameters "coordinates" and "radius" are required."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getMyCourses = async function(req, res){
  try{
    var qname = req.query.name;
    var qcoordinates = req.query.coordinates;
    var qradius = req.query.radius;
    var qtopic = req.query.topic;
    var qstartdate = req.query.startdate;
    var qenddate = req.query.enddate;

    var query = {
      participants: {$in: req.user.id}
    };
    if(qname){
      query.name = qname;
    }
    if(qtopic){
      query.topic = qtopic;
    }
    if(qstartdate){
      query.startdate = {$gte: qstartdate};
    }
    if(qenddate){
      query.enddate = {$lte: qenddate};
    }
    if(qcoordinates || qradius){
      if(qcoordinates && qradius){
        var coords = req.query.coordinates.split(",");
        query.coordinates = {$geoWithin: {$centerSphere: [JSON.parse(qcoordinates), qradius/6378.1]}};
      }
      else {
        return res.status(404).send({
          message: 'To filter courses in a certain radius, the parameters \'coordinates\' and \'radius\' are required.',
        });
      }
    }

    var result = await Course.find(query);
    if(result.length > 0){
      return res.status(200).send({
        message: 'Courses found successfully.',
        courses: result
      });
    }
    else {
      return res.status(400).send({
        message: 'No courses found using the specified parameters.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {put} /api/v1/course/:courseId Change course
 * @apiName putCourse
 * @apiDescription Change information of a course.
 * @apiGroup Course
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 * @apiParam {String} [name] name of the course
 * @apiParam {ObjectId-Array} [badge] the ObjectId of global badges for the course (min: 1); example: `["5e1b0bafeafe4a84c4ac31a9"]`
 * @apiParam {ObjectId-Array} [localbadge] the ObjectId of local badges for the course (min: 1); example: `["5e1b0bafeafe4a84c4ac31a9"]`
 * @apiParam {String} [courseprovider] the provider of the course might be specified by the creator
 * @apiParam {String} [postalcode] postalcode of the building where the course take place
 * @apiParam {String} [address] adress of the location from the Course
 * @apiParam {Coordinates-Array} [coordinates] coordinates of the location from the Course; example: `[longitude, latitude]`
 * @apiParam {String} [topic] topic of the Course
 * @apiParam {String} [description] a biref summary about the course contents
 * @apiParam {String} [requirements] a brief summary about the course requirements
 * @apiParam {Date} [startdate] Date of the start of the course
 * @apiParam {Date} [enddate] Date of the end of the course
 * @apiParam {Number} [size] maximal amount of the course participants; must be greater (equal) than the current signed participants
 *
 * @apiSuccess (Success 200) {String} message `Course is updated successfully.`
 * @apiSuccess (Success 200) {Object} course `{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission putting the course."}`
 * @apiError (On error) {Obejct} 500 Complications during storage.
 *
 */
const putCourse = async function(req, res){
  try {
    var result = await Course.findOne({_id: req.params.courseId});
    if(result){
      if(result.creator == req.user.id){
        result.name = req.body.name || result.name;
        result.courseprovider = req.body.courseprovider || result.courseprovider;
        result.postalcode = req.body.postalcode || result.postalcode;
        result.address = req.body.address || result.address;
        if(req.body.badge){
          result.badge = JSON.parse(req.body.badge);
        }
        if(req.body.localbadge){
          result.localbadge = JSON.parse(req.body.localbadge);
        }
        if(req.body.coordinates){
          result.coordinates.coordinates = JSON.parse(req.body.coordinates);
        }
        result.topic = req.body.topic || result.topic;
        result.description = req.body.description || result.description;
        result.requirements = req.body.requirements || result.requirements;
        result.startdate = req.body.startdate || result.startdate;
        result.enddate = req.body.enddate || result.enddate;
        if(result.participants.length <= req.body.size){
          result.size = req.body.size;
        }

        await result.save();
        return res.status(200).send({
          message: 'Course is updated successfully.',
          course: result
        });
      }
      else {
        return res.status(403).send({
          message: 'No permission putting the course.',
        });
      }
    }
    else {
      return res.status(400).send({
        message: 'Course not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/course/:courseId/participants Get participants of one course
 * @apiName getParticipants
 * @apiDescription Getting all participants of one course by ID.
 * @apiGroup Course
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Participants found successfully.`
 * @apiSuccess (Success 200) {Object} participants `[{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}]'
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission getting the participants of the course."}`
 * @apiError (On error) {Obejct} 500 Complications during storage.
 */
const getParticipants = async function(req, res){
  var courseId = req.params.courseId;
  try {
    var course = await Course.findById(courseId);
    if(course){
      if(course.creator == req.user.id){
        var participants = await User.find({_id: {$in: course.participants}}, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
        return res.status(200).send({
          message: 'Participants found successfully.',
          participants: participants
        });
      }
      else {
        return res.status(403).send({
          message: 'No permission getting the participants of the course.',
        });
      }
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


/**
 * @api {put} /api/v1/course/:courseId/deactivation Deactivate course
 * @apiName putCourseHidden
 * @apiDescription Deactivate a courseed. The course might be no longer in offer.
 * @apiGroup Course
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Course is successfully deactivated.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission deactivating the course."}`
 * @apiError (On error) {Object} 409 `{"message": "Course is already deactivated."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const putCourseHidden = async function(req, res){
  try{
    var result = await Course.findOne({_id: req.params.courseId});
    if(result){
      if(result.creator == req.user.id){
        if(result.exists !== false){
          await Course.updateOne({_id: req.params.courseId}, {exists: false});
          return res.status(200).send({
            message: 'Course is successfully deactivated.'
          });
        }
        else {
          return res.status(409).send({
            message: 'Course is already deactivated.'
          });
        }
      }
      else {
        return res.status(403).send({
          message: 'No permission deactivating the course.',
        });
      }
    }
    else {
      return res.status(400).send({
        message: 'Course not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};

module.exports = {
  postCourse,
  getCourses,
  getMyCourses,
  getCourseID,
  putCourse,
  getParticipants,
  putCourseHidden
};
