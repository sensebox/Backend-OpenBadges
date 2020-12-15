// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const Project = require('../../../../models/project');
const User = require('../../../../models/user');
const MultipleUser = require('../../../../models/multipleUser');


/**
 * @api {get} /api/v1/project/:projectId/participants Get participants of one project
 * @apiName adminGetParticipants
 * @apiDescription Getting all participants of one project by ID
 * @apiGroup Admin
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `Participants found successfully.`
 * @apiSuccess (Success 200) {Object} participants `[{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getParticipants = async function(req, res){
  try{
    var projectId = req.params.projectId;
    var project = await Project.findById(projectId);
    if(project){
      var participantsUser = await User.find({_id: {$in: project.participants}}, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
      var participantsMultipleUser = await MultipleUser.find({_id: {$in: project.participants}}, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
      var participants = participantsUser.concat(participantsMultipleUser);
      return res.status(200).send({
        message: 'Participants found successfully.',
        participants: participants
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


module.exports = {
 getParticipants
};
