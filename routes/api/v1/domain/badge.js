// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const Domain = require('../../../../models/domain');
const Badge = require('../../../../models/badge');
const User = require('../../../../models/user');

/**
 * @api {get} /api/v1/domain/badge Get Badges
 * @apiName domainFindBadge
 * @apiDescription Get (all) Badges by different query. Only accessible for certain domains.
 * @apiGroup Domain
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} [name] find Badges by its name
 * @apiParam {String} [description] find Badges by its description
 * @apiParam {ObejctId} [issuer] the ID of the issuer you are referring to
 * @apiParam {ObejctId} [badgeId] the ID of the Badge you are referring to
 * @apiParam {ObejctId} [userId] the ID of the user you are referring to
 * @apiParam {String} [category] 'achievement', 'professional skill' or 'meta skill'
 *
 * @apiSuccess (Success 200) {String} message `Badges found successfully.`
 * @apiSuccess (Created 201) {Object} badges `[{"name":"name", "issuer":{"_id": ObjectId, "firstname":"Max", "lastname":"Mustermann"}, "request":{"_id": ObjectId, "firstname":"Max", "lastname":"Mustermann"}, "description": "description", "criteria":"criteria", "global": true, "exists": true, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getBadges = async function(req, res){
  try{
      var qname  = req.query.name;
      var qdescription = req.query.description;
      var qissuer = req.query.issuer;
      var qid = req.query.badgeId;
      var qcategory = req.query.category;
      var quserId = req.query.userId;

      var query = {};
      if(qname){
        var regExpEscapeName = qname.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
        query.name = new RegExp(regExpEscapeName, "i");
      }
      if(qdescription){
        var regExpEscapeDescription = qdescription.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
        query.description = new RegExp(regExpEscapeDescription, "i");
      }
      if(qissuer){
        query.$or=[{issuer:{$in: qissuer}},{mentor:{$in: qissuer}}];
      }
      if(qcategory){
        query.category = qcategory;
      }
      if(qid){
        query.id=qid;
      }
      if(quserId){
        var user = await User.findById(quserId, {badge: 1, _id:0});
        if(user){
          query._id = {$in: user.badge};
        }
        else {
          return res.status(404).send({
            message: 'User not found.',
          });
        }
      }
      var result = await Badge.find(query)
                              .populate('issuer', {firstname:1, lastname: 1})
                              .populate('request', {firstname:1, lastname: 1});
      return res.status(200).send({
        message: 'Badges found succesfully.',
        badges: result
      });
  }
  catch(err){
    console.log(err);
    return res.status(500).send(err);
  }
};


/**
 * @api {put} /api/v1/domain/badge/:badgeId/assigne/user/:userId Assigne a Badge
 * @apiName domainAssigneBadge
 * @apiDescription Assigne a Badge to an user. Only accessible for certain domains.
 * @apiGroup Domain
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge is assigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Badge is already assigned to user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const assigneBadge = async function(req, res){
  try{
    var badgeId = req.params.badgeId;
    var userId = req.params.userId;
    var badge = await Badge.findById(badgeId);
    if(badge){
      var user = await User.findById(userId);
      if(user){
        if(user.badge.indexOf(badgeId) < 0){
          // badge is not assigned to user
          user.badge.push(badgeId);
          const updatedUser = await user.save();
          return res.status(200).send({
            message: 'Badge is assigned successfully to user.',
            badge: badge
          });
        }
        else {
          return res.status(400).send({
            message: 'Badge is already assigned to user.',
            badge: badge
          });
        }
      }
      else {
        return res.status(404).send({
          message: 'User not found.',
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Badge not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/domain/user/:userId Get one user
 * @apiName domainGetOneUser
 * @apiDescription Get details about one user. Only accessible for certain domains.
 * @apiGroup Domain
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `User found successfully.`
 * @apiSuccess (Success 200) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getOneUser = async function(req, res){
  const userId = req.params.userId;
  try{
    const user = await User.findById(userId, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
    if(user){
      console.log(user);
      return res.status(200).send({
        message: 'User found successfully.',
        user: user
      });
    }
    return res.status(404).send({
      message: 'User not found.',
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


module.exports = {
 getBadges,
 assigneBadge,
 getOneUser
};
