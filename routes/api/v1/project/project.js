// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const Project = require('../../../../models/project');
const Badge = require('../../../../models/badge');
const User = require('../../../../models/user');
const {projectValidation} = require('../../../../helper/validation/project');



/**
 * @api {post} /api/v1/project Create project
 * @apiName createProject
 * @apiDescription Create a new project.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} name name of the project
 * @apiParam {ObjectId-Array} badge the ObjectId of global badges for the project (min: 1) </br> example: `["5e1b0bafeafe4a84c4ac31a9"]`
 * @apiParam {String} provider the provider of the project might be specified by the creator
 * @apiParam {String} [postalcode] postalcode of the building where the project take place
 * @apiParam {String} [address] adress of the location from the project
 * @apiParam {Coordinates-Array} [coordinates] coordinates of the location from the project </br> example: `[longitude, latitude]`
 * @apiParam {String} topic topic of the project
 * @apiParam {String} description a brief summary about the project contents
 * @apiParam {String} requirements a brief summary about the project requirements
 * @apiParam {Date} startdate Date of the start of the project
 * @apiParam {Date} enddate Date of the end of the project
 * @apiParam {Number} size maximal amount of the project participants
 * @apiParam {File} [image] image-File (Only images with extension 'PNG', 'JPEG', 'JPG' and 'GIF' are allowed.)
 *
 * @apiSuccess (Created 201) {String} message `Project is successfully created.`
 * @apiSuccess (Created 201) {Object} project `{"name":"name", "badge"= [<badgeId>, <badgeId>], "creator": <userId>, "provider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 400 `{"message": "All badges must be assignable by the project-creator."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const postProject = async function(req, res){
  if(req.fileValidationError){
    return res.status(422).send({message: req.fileValidationError});
  }
  const {error} = projectValidation(req.body);
  if(error) return res.status(422).send({message: error.details[0].message});

  try{
    const promises = req.body.badge.map(async function(badgeId){return await Badge.findById(badgeId);});
    const badges = await Promise.all(promises);
    var badgesError = badges.filter(badge => badge.issuer.concat(badge.mentor).indexOf(req.user.id) < 0);
    if(badgesError.length > 0){
      return res.status(400).send({message: "All badges must be assignable by the project-creator."});
    }
    const body = {
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      badge: req.body.badge,
      creator: req.user.id,
      provider: req.body.provider,
      topic: req.body.topic,
      description: req.body.description,
      requirements: req.body.requirements,
      startdate: req.body.startdate,
      enddate: req.body.enddate,
      size: req.body.size
    };
    // presence project
    if(req.body.coordinates && req.body.address && req.body.postalcode){
      body.coordinates = {type: 'Point', coordinates: req.body.coordinates};
      body.address = req.body.address;
      body.postalcode = req.body.postalcode;
    }
    // project image
    if(req.file){
      const image = {
        path: req.file.filename,
        size: req.file.size,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      };
      body.image = image;
    }
    const project = new Project(body);
    const savedProject = await project.save();
    // updates the role to issuer, because the user issues a new project.
    if(req.user.role == 'earner'){
      await User.updateOne({_id: req.user.id}, {role: 'issuer'});
    }
    return res.status(201).send({
      message: 'Project is successfully created.',
      project: savedProject
    });
  }
  catch(err) {
    console.log(err);
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/project Get projects
 * @apiName getProjects
 * @apiDescription Get all projects respectivly get projects by different parameters which exist.
 * @apiGroup Project
 *
 * @apiParam {String} [name] project name
 * @apiParam {Coordinates-Array} [coordinates] coordinates in which radius might be an project </br> example: `[longitude, latitude]`
 * @apiParam {Number} [radius] radius [in km] about a pair of coordinates
 * @apiParam {Date} [startdate] greater (or equal) than the startdate of the project
 * @apiParam {Date} [enddate] lower (or equal) than the enddate of the project
 * @apiParam {String} [topic] project topic
 * @apiParam {String} [type] project type (`online` or `presence`)
 *
 * @apiSuccess (Success 200) {String} message `Project found successfully.`
 * @apiSuccess (Success 200) {Object} projects `[{"name":"name", "badge"= [<badgeId>, <badgeId>], "creator": <userId>, "provider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "To filter projects in a certain radius, the parameters "coordinates" and "radius" are required."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getProjects = async function(req, res){
  try{
    var qname = req.query.name;
    var qcoordinates = req.query.coordinates;
    var qradius = req.query.radius;
    var qtopic = req.query.topic;
    var qstartdate = req.query.startdate;
    var qenddate = req.query.enddate;
    var qtype = req.query.type;

    var query = {
      exists: true
    };
    if(qname){
      var regExpEscapeName = qname.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
      query.name = new RegExp(regExpEscapeName, "i");
    }
    if(qtopic){
      var regExpEscapeTopic = qtopic.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
      query.topic = new RegExp(regExpEscapeTopic, "i");
    }
    if(qstartdate){
      query.startdate = {$gte: qstartdate};
    }
    if(qenddate){
      query.enddate = {$lte: qenddate};
    }
    if(qtype){
      if(qtype === 'online'){
        query.postalcode = { $exists: false};
      }
      else if(qtype === 'presence'){
        query.postalcode = { $exists: true};
      }
    }
    if(qcoordinates || qradius){
      if(qcoordinates && qradius){
        query.coordinates = {$geoWithin: {$centerSphere: [qcoordinates, qradius/6378.1]}};
      }
      else {
        return res.status(404).send({
          message: 'To filter projects in a certain radius, the parameters \'coordinates\' and \'radius\' are required.',
        });
      }
    }

    var result = await Project.find(query);
    return res.status(200).send({
      message: 'Projects found successfully.',
      projects: result
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {get} /api/v1/project/:projectId Get project
 * @apiName getProject
 * @apiDescription Get one project by project-id.
 * @apiGroup Project
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Project found successfully.`
 * @apiSuccess (Success 200) {Object} project `{"name":"name", "badge"= [<badgeId>, <badgeId>], "creator": <userId>, "provider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 404 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getProjectID = async function(req, res){
  try{
    var project = await Project.findOne({_id: req.params.projectId})
                             .populate('creator', {firstname:1, lastname: 1})
                             .populate('badge');
    if(project){
      return res.status(200).send({
        message: 'Project found successfully.',
        project: project
      });
    }
    else {
      return res.status(404).send({
        message: 'Project not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/project/me Get my projects
 * @apiName getMyProjects
 * @apiDescription Get (all) projects of currently signed in User by different queries.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} [name] project name
 * @apiParam {Coordinates-Array} [coordinates] coordinates in which radius might be an project </br> example: `[longitude, latitude]`
 * @apiParam {Number} [radius] radius [in km] about a pair of coordinates
 * @apiParam {Date} [startdate] greater (or equal) than the startdate of the project
 * @apiParam {Date} [enddate] lower (or equal) than the enddate of the project
 * @apiParam {String} [topic] project topic
 * @apiParam {String} [type] project type (`online` or `presence`)
 *
 * @apiSuccess (Success 200) {String} message `Projects found successfully.`
 * @apiSuccess (Success 200) {Object} projects `[{"name":"name", "badge"= [<badgeId>, <badgeId>], "creator": <userId>, "provider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "To filter projects in a certain radius, the parameters "coordinates" and "radius" are required."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getMyProjects = async function(req, res){
  try{
    var qname = req.query.name;
    var qcoordinates = req.query.coordinates;
    var qradius = req.query.radius;
    var qtopic = req.query.topic;
    var qstartdate = req.query.startdate;
    var qenddate = req.query.enddate;
    var qtype = req.query.type;

    var query = {
      participants: {$in: req.user.id},
      exists: true
    };
    if(qname){
      var regExpEscapeName = qname.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
      query.name = new RegExp(regExpEscapeName, "i");
    }
    if(qtopic){
      var regExpEscapeTopic = qtopic.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
      query.topic = new RegExp(regExpEscapeTopic, "i");
    }
    if(qstartdate){
      query.startdate = {$gte: qstartdate};
    }
    if(qenddate){
      query.enddate = {$lte: qenddate};
    }
    if(qtype){
      if(qtype === 'online'){
        query.postalcode = { $exists: false};
      }
      else if(qtype === 'presence'){
        query.postalcode = { $exists: true};
      }
    }
    if(qcoordinates || qradius){
      if(qcoordinates && qradius){
        query.coordinates = {$geoWithin: {$centerSphere: [qcoordinates, qradius/6378.1]}};
      }
      else {
        return res.status(404).send({
          message: 'To filter projects in a certain radius, the parameters \'coordinates\' and \'radius\' are required.',
        });
      }
    }

    var result = await Project.find(query);
    return res.status(200).send({
      message: 'Projects found successfully.',
      projects: result
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {get} /api/v1/project/creator/me/ Get my created projects
 * @apiName getMyCreatedProjects
 * @apiDescription Get (all) created projects of currently signed in User by different queries.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} [name] project name
 * @apiParam {Coordinates-Array} [coordinates] coordinates in which radius might be an project </br> example: `[longitude, latitude]`
 * @apiParam {Number} [radius] radius [in km] about a pair of coordinates
 * @apiParam {Date} [startdate] greater (or equal) than the startdate of the project
 * @apiParam {Date} [enddate] lower (or equal) than the enddate of the project
 * @apiParam {String} [topic] project topic
 * @apiParam {String} [type] project type (`online` or `presence`)
 *
 * @apiSuccess (Success 200) {String} message `Projects found successfully.`
 * @apiSuccess (Success 200) {Object} projects `[{"name":"name", "badge"= [<badgeId>, <badgeId>], "creator": <userId>, "provider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "To filter projects in a certain radius, the parameters "coordinates" and "radius" are required."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getMyCreatedProjects = async function(req, res){
  try{
    var qname = req.query.name;
    var qcoordinates = req.query.coordinates;
    var qradius = req.query.radius;
    var qtopic = req.query.topic;
    var qstartdate = req.query.startdate;
    var qenddate = req.query.enddate;
    var qtype = req.query.type;

    var query = {
      creator: req.user.id,
      exists: true
    };
    if(qname){
      var regExpEscapeName = qname.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
      query.name = new RegExp(regExpEscapeName, "i");
    }
    if(qtopic){
      var regExpEscapeTopic = qtopic.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
      query.topic = new RegExp(regExpEscapeTopic, "i");
    }
    if(qstartdate){
      query.startdate = {$gte: qstartdate};
    }
    if(qenddate){
      query.enddate = {$lte: qenddate};
    }
    if(qtype){
      if(qtype === 'online'){
        query.postalcode = { $exists: false};
      }
      else if(qtype === 'presence'){
        query.postalcode = { $exists: true};
      }
    }
    if(qcoordinates || qradius){
      if(qcoordinates && qradius){
        query.coordinates = {$geoWithin: {$centerSphere: [qcoordinates, qradius/6378.1]}};
      }
      else {
        return res.status(404).send({
          message: 'To filter projects in a certain radius, the parameters \'coordinates\' and \'radius\' are required.',
        });
      }
    }

    var result = await Project.find(query);
    return res.status(200).send({
      message: 'Projects found successfully.',
      projects: result
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {put} /api/v1/project/:projectId Change project
 * @apiName putProject
 * @apiDescription Change information of a project.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 * @apiParam {String} [name] name of the project
 * @apiParam {ObjectId-Array} [badge] the ObjectId of global badges for the project (min: 1) </br> example: `["5e1b0bafeafe4a84c4ac31a9"]`
 * @apiParam {String} [provider] the provider of the project might be specified by the creator
 * @apiParam {String} [postalcode] postalcode of the building where the project take place
 * @apiParam {String} [address] adress of the location from the project
 * @apiParam {Coordinates-Array} [coordinates] coordinates of the location from the project </br> example: `[longitude, latitude]`
 * @apiParam {String} [topic] topic of the project
 * @apiParam {String} [description] a biref summary about the project contents
 * @apiParam {String} [requirements] a brief summary about the project requirements
 * @apiParam {Date} [startdate] Date of the start of the project
 * @apiParam {Date} [enddate] Date of the end of the project
 * @apiParam {Number} [size] maximal amount of the project participants; must be greater (equal) than the current signed participants
 * @apiParam {File} [image] image-File (Only images with extension 'PNG', 'JPEG', 'JPG' and 'GIF' are allowed.)
 *
 * @apiSuccess (Success 200) {String} message `Project is updated successfully.`
 * @apiSuccess (Success 200) {Object} project `{"name":"name", "badge"= [<badgeId>, <badgeId>], "creator": <userId>, "provider": <String>, "postalcode": <Number>, "address": <String>, "coordinates": [Number, Number], "topic": <String>, "description": <String>, "requirements": <String>, "startdate": <Date>, "enddate": <Date>, "participants": [<UserId>, <UserId>], "size": <Number>, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 400 `{"message": "All badges must be assignable by the project-creator."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission putting the project."}`
 * @apiError (On error) {Object} 404 `{"message": "Project not found."}`
 * @apiError (On error) {Obejct} 500 Complications during storage.
 *
 */
const putProject = async function(req, res){
  const {error} = projectValidation(req.body);
  if(error) return res.status(422).send({message: error.details[0].message});

  try {
    var result = await Project.findOne({_id: req.params.projectId});
    if(result){
      if(result.creator == req.user.id){
        result.name = req.body.name || result.name;
        result.provider = req.body.provider || result.provider;
        result.postalcode = req.body.postalcode || result.postalcode;
        result.address = req.body.address || result.address;
        if(req.body.badge){
          const promises = req.body.badge.map(async function(badgeId){return await Badge.findById(badgeId);});
          const badges = await Promise.all(promises);
          console.log(badges);
          var badgesError = badges.filter(badge => badge.issuer.concat(badge.mentor).indexOf(req.user.id) < 0);
          if(badgesError.length > 0){
            return res.status(400).send({message: "All badges must be assignable by the project-creator."});
          }
          result.badge = req.body.badge;
        }
        if(req.body.coordinates){
          result.coordinates.coordinates = req.body.coordinates;
        }
        result.topic = req.body.topic || result.topic;
        result.description = req.body.description || result.description;
        result.requirements = req.body.requirements || result.requirements;
        result.startdate = req.body.startdate || result.startdate;
        result.enddate = req.body.enddate || result.enddate;
        if(result.participants.length <= req.body.size){
          result.size = req.body.size;
        }

        if(req.file){
          const image = {
            path: req.file.filename,
            size: req.file.size,
            contentType: req.file.mimetype,
            originalName: req.file.originalname,
          };
          if(result.image.path){
            fs.unlink(path.join(__dirname, '..', '..', '..', '..', 'upload', result.image.path), function(err) {
              // if(err && err.code == 'ENOENT') {
              //   // file doens't exist
              //   console.info("File doesn't exist, won't remove it.");
              // } else if (err) {
              //   // other errors, e.g. maybe we don't have enough permission
              //   console.error("Error occurred while trying to remove file");
              // } else {
              //   console.info(`removed`);
              // }
            });
          }
          result.image = image;
        }

        await result.save();
        const updatedProject = await Project.findById(result._id)
                                          .populate('creator', {firstname:1, lastname: 1})
                                          .populate('badge');
        return res.status(200).send({
          message: 'Project is updated successfully.',
          project: updatedProject
        });
      }
      else {
        return res.status(403).send({
          message: 'No permission putting the project.',
        });
      }
    }
    else {
      return res.status(400).send({
        message: 'Project not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/project/:projectId/participants Get participants of one project
 * @apiName getParticipants
 * @apiDescription Getting all participants of one project by ID.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Participants found successfully.`
 * @apiSuccess (Success 200) {Object} participants `[{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 400 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission getting the participants of the project."}`
 * @apiError (On error) {Obejct} 500 Complications during storage.
 */
const getParticipants = async function(req, res){
  var projectId = req.params.projectId;
  try {
    var project = await Project.findById(projectId);
    if(project){
      if(project.creator == req.user.id){
        var participants = await User.find({_id: {$in: project.participants}}, {__v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
        return res.status(200).send({
          message: 'Participants found successfully.',
          participants: participants
        });
      }
      else {
        return res.status(403).send({
          message: 'No permission getting the participants of the project.',
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Project not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {post} /api/v1/project/:projectId/badge/notification Notification of received project badges
 * @apiName projectBadgeNotification
 * @apiDescription Sending an email to all project participants with their received project badges
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Email sent successfully.`
 * @apiSuccess (Success 200) {Number} accepted `count of accepted email addresses`
 * @apiSuccess (Success 200) {Array} rejected `array of rejected email addresses`
 *
 * @apiError (On error) {Object} 400 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission getting the participants of the project."}`
 * @apiError (On error) {Obejct} 500 Complications during sending emails.
 */
const projectBadgeNotification = async function(req, res){
  var projectId = req.params.projectId;
  try {
    var project = await Project.findById(projectId);
    if(project){
      if(project.creator == req.user.id){
        var participants = await User.find({_id: {$in: project.participants}}, {__v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0, image: 0, role: 0, date: 0, birthday: 0, city: 0, postalcode: 0, username: 0, _id: 0});
        var projectBadges = await Project.findById(projectId).populate('badge');

        // send an email to participant of project to inform him about the badges received
        const email = process.env.EMAIL;
        const password = process.env.EMAIL_PASSWORD;
        const host = process.env.EMAIL_HOST;

        let transporter = nodemailer.createTransport({
          host: host,
          port: 465,
          secure: true, // if false TLS
          auth: {
              user: email, // email of the sender
              pass: password // Passwort of the sender
          },
          tls: {
              // do not fail on invalid certs
              rejectUnauthorized: false
          }
        });

        const link =
          process.env.NODE_ENV === "production" ?
            `https://${process.env.APP_HOST}`
          : `http://${process.env.APP_HOST}:${process.env.APP_PORT}`;


        var promises = participants.map(async participant => {
          var correspondingBadges = participant.badge.filter(badge => project.badge.includes(badge));
          var badges = await Badge.find({_id: {$in: correspondingBadges}});

          var head = `<head>
                        <meta charset="utf-8"/>`+
                        // <style>img { border-radius: 50%; width: 200px; height: 200px; object-fit: cover; }</style>
                     `</head>`;
          var body = `<body><b>Hallo ${participant.firstname} ${participant.lastname},</b><br>du hast das Projekt ${project.name} mit folgenden Badges abgeschlossen:<br><ul>`;
          badges.map(badge => {
            body += '<li>'+
                      //<img style="border-radius: 50%; width: 200px; height: 200px; object-fit: cover;" src="${link}/media/${badge.image.path}" alt="${badge.name}"/>
                      `<p>${badge.name}</p>
                    </li>`;
          });

          body += `</ul><p>Du kannst dich auf <a href="${link}">MyBadges.org</a> anmelden, um weitere Badges zu sammeln und dein Konto zu pflegen.</p><p>Viele Grüße<br>Dein MyBadges-Team</p></body>`;

          var mailOptions = {
              from: '"MyBadges"'+email, // sender address
              to: participant.email, // list of receiver
              subject: `Projekt ${project.name} abgeschlossen`, // Subject line
              html: `<!DOCTYPE html><html lang="de">${head}${body}</html>`
          };
          // send mail with defined transport object
          return transporter.sendMail(mailOptions);
        });

        var send = await Promise.all(promises);
        return res.status(200).send({
          message: `Emails sent successfully.`,
          accepted: send.filter(email => email.accepted.length > 0).length,
          rejected: send.filter(email => email.rejected.length > 0).map(email => email.rejected[0])
        });
      }
      else {
        return res.status(403).send({
          message: 'No permission getting the participants of the project.',
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Project not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {put} /api/v1/project/:projectId/deactivation Deactivate project
 * @apiName putProjectHidden
 * @apiDescription Deactivate a project. The project might be no longer in offer.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Project is successfully deactivated.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission deactivating the project."}`
 * @apiError (On error) {Object} 409 `{"message": "Project is already deactivated."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const putProjectHidden = async function(req, res){
  try{
    var result = await Project.findOne({_id: req.params.projectId});
    if(result){
      if(result.creator == req.user.id){
        if(result.exists !== false){
          await Project.updateOne({_id: req.params.projectId}, {exists: false});
          return res.status(200).send({
            message: 'Project is successfully deactivated.'
          });
        }
        else {
          return res.status(409).send({
            message: 'Project is already deactivated.'
          });
        }
      }
      else {
        return res.status(403).send({
          message: 'No permission deactivating the project.',
        });
      }
    }
    else {
      return res.status(400).send({
        message: 'Project not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};

module.exports = {
  postProject,
  getProjects,
  getMyProjects,
  getMyCreatedProjects,
  getProjectID,
  putProject,
  getParticipants,
  putProjectHidden,
  projectBadgeNotification
};
