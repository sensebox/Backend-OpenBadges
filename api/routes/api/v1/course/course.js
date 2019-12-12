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
    badge: req.body.badge,
    localbadge: req.body.localbadge,
    username: req.body.username,
    courseprovider: req.body.courseprovider,
    postcode: req.body.postcode,
    address: req.body.address,
    coordinates: {type: 'point', coordinates: req.body.coordinates},
    topic: req.body.topic,
    descriptipn: req.body.description,
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
  var result = await course.findOne({_id: req.params.id}, (err, result)=>{
    result.name= req.body.name;
    result.courseprovider= req.body.courseprovider;
    result.postcode= req.body.postcode;
    result.address= req.body.address;

    result.coordinates= {type: 'point', coordinates: req.body.coordinates};
    result.topic= req.body.topic;
    result.description = req.body.description;
    result.requirements= req.body.requirements;
    result.startdate= req.body.startdate;
    result.enddate= req.body.enddate;
  });

};

module.exports = {
  postCourse,
  getCourse,
  getCourseID
};
