// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');

const Course = require('../../../../models/course');


/**
 * @api {post} /course/createCourse Create Course
 * @apiName createCourse
 * @apiDescription Create a new Course
 * @apiGroup Course
 *
 * @apiParam (Parameters for creating a Course) {String} name Name des Kurses kann vom Ersteller eingegeben werden; Character String for a Course Name
 * @apiParam (Parameters for creating a Course) {Badge} badge Badges die dem Kurs zugeordnet sind; Badges for the Course
 * @apiParam (Parameters for creating a Course) {Badge} localbadge Lokale Badges die der Ersteller des Kurses selbst zuordnen kann; Localadge for the Course
 * @apiParam (Parameters for creating a Course) {User} creator of the Course  ; Id to the User who, created the Course
 * @apiParam (Parameters for creating a Course) {String} courseprovider Anbieter des Kurses; The provider of the course might be specified by the creator
 * @apiParam (Parameters for creating a Course) {String} postcode Postcode of the Building where the course take place; Postcode for the location of the Course
 * @apiParam (Parameters for creating a Course) {String} address Adresse des Kurses bei einem festgelegten Ort ; adress of the location from the Course
 * @apiParam (Parameters for creating a Course) {String} coordinates Koordinaten von der Lokalisierung des Kurses; coordinates of the location from the Course
 * @apiParam (Parameters for creating a Course) {String} topic Thema des Kurses kann fuer verschiedene tags festgelegt werden ; topic of the Course
 * @apiParam (Parameters for creating a Course) {String} description Beschreibung des Kurses ; a biref summary about the course contents
 *
 * @apiSuccess (Created 201) {String} message `success`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer"= user, "criteria":"criteria", "image":"image"}'
 *
 */
const postCourse = async function(req, res){
  console.log(req.user.id);
  const course = new Course({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    badge: req.body.badge,
    localbadge: req.body.localbadge,
    creator: req.user.id,
    courseprovider: req.body.courseprovider,
    postcode: req.body.postcode,
    address: req.body.address,
    'coordinates.coordinates': JSON.parse(req.body.coordinates),
    topic: req.body.topic,
    description: req.body.description,
    requirements: req.body.requirements,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    size: req.body.size,
    exists: true
  });
  try{
    const savedCourse = await course.save();
    return res.status(200).send({course: savedCourse});
  }
  catch(err) {
    return res.status(400).send(err);
  }
};



/** url?name=<placeholder>&coordinates=<lat>,<lng>&startdate=<placeholder> etc.
  *
  */
const getCourse = async function(req, res){
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
    query.startdate = {$gte: {qstartdate}};
  }
  if(qenddate){
    query.enddate = {$lte: {qenddate}};
  }
  if(qcoordinates && qradius){
    var coords = req.query.coordinates.split(",");
    query['coordinates.coordinates'] = {$geowithin: {$centerSphere: [qcoordinates, qradius]}};
  }

  const course = new Course();
  var result = await course.find(query);

  res.send(result);
};

// url/:id
const getCourseID = async function(req, res){
  const course = new Course();
  var result = await course.findOne({_id: req.params.id});
  res.send(result);
};


// url/?
const putCourse = async function(req, res){
  const course = new Course();
  var result = await course.findOne({_id: req.params.id}, (err, resul)=>{
    resul.name= req.body.name;
    resul.courseprovider= req.body.courseprovider;
    resul.postcode= req.body.postcode;
    resul.address= req.body.address;

    resul.coordinates= {type: 'point', coordinates: req.body.coordinates};
    resul.topic= req.body.topic;
    resul.description = req.body.description;
    resul.requirements= req.body.requirements;
    resul.startdate= req.body.startdate;
    resul.enddate= req.body.enddate;
  });

};


/**
 * @api {get} /course/getParticipants get participants of the course
 * @apiName getParticipants
 * @apiDescription getting all participants of one course by ID
 * @apiGroup Course
 *
 * @apiSuccess (Created 201) {String} message `success`
 * @apiSuccess (Created 201) {Object} course `{"participants": participants}'
 *
  * @apiError (On error) {String} 404 `{"message": "Invalid CourseID."}`
 */
const getParticipants = async function(req, res){
  const course = new Course();
  var result = await course.findOne({_id: req.params.id}, (err, result)=>{
  });

  if(result){
    return res.status(200).send({
      message: 'User found successfully.',
      participants: result.participants
    });
  }
  return res.status(404).send({
    message: 'Invalid CourseID.',
  });
};

const putCourseHidden = async function(req, res){
  const course = new Course();
  var result = await course.findOne({_id: req.params.id}, (err, result)=>{
  });
  if(re)
  if(result){
    result.exists = false;
    return res.status(200).send({
      message: 'Course is now deactivated'
    });
  }
  return res.status(404).send({
    message: 'Error deactivating course',
  });
};

module.exports = {
  postCourse,
  getCourse,
  getCourseID,
  getParticipants
};
