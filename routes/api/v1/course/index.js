// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');

const Course = require('../../../../models/course');



const postCourse = async function(req, res){
  const course = new Course({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    username: req.body.username,
    courseprovider: req.body.courseprovider,
    postcode: req.body.postcode,
    address: req.body.address,

    coordinates: {type: 'point', coordinates: req.body.coordinates},
    topic: req.body.topic,
    decriptipn: req.body.description,
    requirements: req.body.requirements,
    startdate: req.body.startdate,
    enddate: req.body.enddate
  });
  try{
    const savedCourse = await course.save();
    return res.status(200).send({course: savedCourse});
  }
  catch(err) {
    return res.status(400).send(err);
  }
};



/** url?name=<placeholder>&coordinates=[<lat>,<lng>]&startdate=<placeholder> etc.
  *
  */
const getCourses = async function(req, res){
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
    query.name = {$gte: {qstartdate}};
  }
  if(qcoordinates.notEmpty() && qradius.notEmpty()){
    query.coordinates = {$geowithin: {$centerSphere: [qcoordinates, qradius]}};
  }
  if(qenddate){
    query.name = {$lte: {qenddate}};
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

module.exports = {
  postCourse,
  getCourses,
  getCourseID
};
