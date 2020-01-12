// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');

const Course = require('../../../../models/course');
const User = require('../../../../models/user');



/**
 * @api {post} /api/v1/course Create Course
 * @apiName createCourse
 * @apiDescription Create a new Course
 * @apiGroup Course
 *
 * @apiParam (Parameters for creating a Course) {String} name name of the course
 * @apiParam (Parameters for creating a Course) {ObjectId-Array} badge the ObjectId of global badges for the course
 * @apiParam (Parameters for creating a Course) {ObjectId-Array} localbadge the ObjectId of local badges for the Course
 * @apiParam (Parameters for creating a Course) {String} courseprovider the provider of the course might be specified by the creator
 * @apiParam (Parameters for creating a Course) {String} postalcode postalcode of the building where the course take place
 * @apiParam (Parameters for creating a Course) {String} address adress of the location from the Course
 * @apiParam (Parameters for creating a Course) {Coordinates-Array} coordinates coordinates of the location from the Course
 * @apiParam (Parameters for creating a Course) {String} topic topic of the Course
 * @apiParam (Parameters for creating a Course) {String} description a brief summary about the course contents
 * @apiParam (Parameters for creating a Course) {String} requirements a brief summary about the course requirements
 * @apiParam (Parameters for creating a Course) {Date} startdate Date of the start of the course
 * @apiParam (Parameters for creating a Course) {Date} enddate Date of the end of the course
 * @apiParam (Parameters for creating a Course) {Number} size maximal amount of the course participants


 * @apiParam (Parameters for creating a Course) {String} description a biref summary about the course contents

 *
 * @apiSuccess (Created 201) {String} message `Course is successfully created.`
 * @apiSuccess (Created 201) {Object} course `{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}'
 *
 * @apiError (On error) {Object} 500 `{"message": "Complications during storage."}`
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
 * @api {get} /api/v1/course Get Courses
 * @apiName getCourses
 * @apiDescription Get all courses respectivly get courses by different parameters
 * @apiGroup Course
 *
 * @apiParam (Parameters for searching a Course) {String} name course name
 * @apiParam (Parameters for searching a Course) {Coordinates-Array} coordinates coordinates in which radius might be an course
 * @apiParam (Parameters for searching a Course) {Number} radius radius [in km] about a pair of coordinates
 * @apiParam (Parameters for searching a Course) {Date} startdate greater (or equal) than the startdate of the course
 * @apiParam (Parameters for searching a Course) {Date} enddate lower (or equal) than the enddate of the course
 * @apiParam (Parameters for searching a Course) {String} topic course topic
 *
 * @apiSuccess (Success 200) {String} message `Courses found successfully.`
 * @apiSuccess (Success 200) {Object} courses `[{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}]`
 *
 * @apiError (On error) {Object} 400 `{"message": "No courses found using the specified parameters."}`
 * @apiError (On error) {Object} 404 `{"message": "To filter courses in a certain radius, the parameters "coordinates" and "radius" are required."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during storage."}`
 */
const getCourses = async function(req, res){
  try{
    var qname = req.query.name;
    var qcoordinates = req.query.coordinates;
    var qradius = req.query.radius;
    var qtopic = req.query.topic;
    var qstartdate = req.query.startdate;
    var qenddate = req.query.enddate;

    var query = {};
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
 * @api {get} /api/v1/course/:courseId Get Course
 * @apiName getCourse
 * @apiDescription Get one course by course-id.
 * @apiGroup Course
 *
 * @apiSuccess (Success 200) {String} message `Course found successfully.`
 * @apiSuccess (Success 200) {Object} course `{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during storage."}`
 */
const getCourseID = async function(req, res){
  try{
    var course = await Course.findOne({_id: req.params.courseId});
    if(course){
      return res.status(200).send({
        message: 'Course found successfully.',
        course: course
      });
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
 * @api {put} /api/v1/course/:courseId Put course
 * @apiName putCourse
 * @apiDescription Put a course.
 * @apiGroup Course
 *
 * @apiParam (Parameters for putting a Course) {String} name name of the course
 * @apiParam (Parameters for putting a Course) {ObjectId-Array} badge the ObjectId of global badges for the course
 * @apiParam (Parameters for putting a Course) {ObjectId-Array} localbadge the ObjectId of local badges for the Course
 * @apiParam (Parameters for putting a Course) {String} courseprovider the provider of the course might be specified by the creator
 * @apiParam (Parameters for putting a Course) {String} postalcode postalcode of the building where the course take place
 * @apiParam (Parameters for putting a Course) {String} address adress of the location from the Course
 * @apiParam (Parameters for putting a Course) {Coordinates-Array} coordinates coordinates of the location from the Course
 * @apiParam (Parameters for putting a Course) {String} topic topic of the Course
 * @apiParam (Parameters for putting a Course) {String} description a biref summary about the course contents
 * @apiParam (Parameters for creating a Course) {String} requirements a brief summary about the course requirements
 * @apiParam (Parameters for creating a Course) {Date} startdate Date of the start of the course
 * @apiParam (Parameters for creating a Course) {Date} enddate Date of the end of the course
 * @apiParam (Parameters for creating a Course) {Number} size maximal amount of the course participants; must be greater (equal) than the current signed participants
 *
 * @apiSuccess (Success 200) {String} message `Course putting successfully.`
 * @apiSuccess (Success 200) {Object} course `{"name":"name", "badge"= [<badgeId>, <badgeId>], "localbadge"= [<badgeId>, <badgeId>], "creator": <userId>, "courseprovider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission putting the course."}`
 * @apiError (On error) {Obejct} 500 `{"message": "Complications during storage."}`
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
          message: 'Course put successfully.',
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
 * @apiDescription getting all participants of one course by ID
 * @apiGroup Course
 *
 * @apiSuccess (Success 200) {String} message `Participants found successfully.`
 * @apiSuccess (Success 200) {Object} participants `<User>'
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission getting the participants of the course."}`
 * @apiError (On error) {Obejct} 500 `{"message": "Complications during storage."}`
 */
const getParticipants = async function(req, res){
  var courseId = req.params.courseId;
  try {
    var course = await Course.findById(courseId);
    if(course){
      if(course.creator == req.user.id){
        var participants = await User.find({_id: {$in: course.participants}});
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
 * @apiDescription change a course to deactivated. The course might be no longer in offer.
 * @apiGroup Course
 *
 * @apiSuccess (Success 200) {String} message `Course is successfully deactivated.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission deactivating the course."}`
 * @apiError (On error) {Object} 409 `{"message": "Course is already deactivated."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during storage."}`
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
  getCourseID,
  putCourse,
  getParticipants,
  putCourseHidden
};
