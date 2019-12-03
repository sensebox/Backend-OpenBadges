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

/**
  * Überpüft ob ein Kurs innerhalb eines Radius eines bestimmten Gebiets liegt
  * @params searchedPoint Punkt eines Kurs [lat,lng]
  * @params sourcePoint Punkt den User festgelegt hat [lat,lng]
  * @params radius Der Radius um den sourcePoint in dem sich der searched Point befinden sollte
  * @return true or false
  */
function pointInRadius(searchedPoint, sourcePoint, radius){
    var coordSqd = (searchedPoint[0] - sourcePoint[0])**2 + (searchedPoint[1] - sourcePoint[1])**2;
    var radiusSqd = radius **2;
    if(coordSqd < radiusSqd){
      return true;
    }else{
      return false;
    }
}




const getCourse = async function(req, res){
  var qname = req.query.name || {};
  var qcoordinates = req.query.coordinates || {};
  var qradius = req.query.radius || {};
  var qtopic = req.query.topic || {};
  var qstartdate = req.query.startdate ||{};
  var qenddate = req.query.enddate || {};
  const course = new Course();
  var query = course.find();
  if(qcoordinates.notEmpty() && qradius.notEmpty()){
    var area = {center: qcoordinates,radius: qradius };
    query.where("coordinates.coordinates").within().centerSphere(area);
  }
  query.where("name", qname).
  where("topic", qtopic).
  where("startdate", qstartdate).
  where("enddate", qenddate);

  res.send(query);
};



module.exports = {
  postCourse
};
