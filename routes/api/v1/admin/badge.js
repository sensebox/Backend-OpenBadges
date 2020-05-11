// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Badge = require('../../../../models/badge');
const User = require('../../../../models/user');
const Course = require('../../../../models/course');


/**
 * @api {get} /api/v1/admin/badge Get Badges
 * @apiName adminFindBadge
 * @apiDescription Get (all) Badges by different query.
 * @apiGroup Admin
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
 * @apiParam {Boolean} [global] if true, get global Badges; if false, get local Badges
 *
 * @apiSuccess (Success 200) {String} message `Badges found successfully.`
 * @apiSuccess (Created 201) {Object} badges `[{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getBadges = async function(req, res){
  var qname  = req.query.name;
  var qdescription = req.query.description;
  var qissuer = req.query.issuer;
  var qid = req.query.badgeId;
  var qglobal = req.query.global;
  var quserId = req.query.userId;

  try{
    var query = {};
    if(qname){
      query.name = qname;
    }
    if(qdescription){
      query.description=qdescription;
    }
    if(qissuer){
      query.issuer=qissuer;
    }
    if(qid){
      query.id=qid;
    }
    if(qglobal){
      query.global = qglobal;
    }
    if(quserId){
      var user = await User.findById(quserId, {badge: 1, localbadge: 1, _id:0});
      if(user){
        query.$or = [{_id: {$in: user.badge}}, {_id: {$in: user.localbadge}}];
      }
      else {
        return res.status(404).send({
          message: 'User not found.',
        });
      }
    }
    const badge= new Badge();
    var result = await badge.find(query);
    return res.status(200).send({
      message: 'Badges found succesfully.',
      badges: result
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {post} /api/v1/admin/badge Create global Badge
 * @apiName createGlobalBadge
 * @apiDescription Create a new global Badge.
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} name title of Badge
 * @apiParam {String} description a brief summary of the Badge
 * @apiParam {String} critera criterias getting this Badge
 * @apiParam {File} [image] image-File (Only images with extension 'PNG', 'JPEG', 'JPG' and 'GIF' are allowed.)
 *
 * @apiSuccess (Created 201) {String} message `Global Badge is succesfully created.`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}'
 *
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const postGlobalBadge = async function(req, res){
  try{
    var body = {
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      description: req.body.description,
      criteria: req.body.criteria,
      issuer: req.user.id,
      global: true
    };
    if(req.file){
      const image = {
        path: req.file.filename,
        size: req.file.size,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      };
      body.image = image;
    }
    const badge = new Badge(body);
    const savedBadge = await badge.save();
    return res.status(201).send({
      message: 'Global Badge is succesfully created.',
      badge: savedBadge
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {put} /api/v1/admin/badge/:badgeId Update Badge
 * @apiName AdminPutBadge
 * @apiDescription Change information of a Badge (global | local).
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {String} [name] title of Badge
 * @apiParam {String} [description] a brief summary of the Badge
 * @apiParam {String} [critera] criterias getting this Badge
 * @apiParam {Boolean} [exists] if false, badge is deactivated
 * @apiParam {File} [image] image-File (Only images with extension 'PNG', 'JPEG', 'JPG' and 'GIF' are allowed.)
 *
 * @apiSuccess (Success 200) {String} message `Badge updated successfully.` or `Badge not changed.`
 * @apiSuccess (Success 200) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": false, "exists": true, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 404 `{"message": "Local Badge not found."}
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const putBadge = async function(req, res){
  try {
    var badge = await Badge.findById(req.params.badgeId);
    if(badge){
      var updatedBadge = {};
      if(req.body.name) updatedBadge.name = req.body.name;
      if(req.body.description) updatedBadge.description = req.body.description;
      if(req.body.criteria) updatedBadge.criteria = req.body.criteria;
      if(req.body.exists) updatedBadge.exists = req.body.exists;
      if(req.file){
        const image = {
          path: req.file.filename,
          size: req.file.size,
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
        };
        if(badge.image.path){
          fs.unlink(path.join(__dirname, '..', '..', '..', '..', 'upload', badge.image.path), function(err) {
          });
        }
        updatedBadge.image = image;
      }
      if(Object.keys(updatedBadge).length > 0){
        var newBadge = await Badge.findOneAndUpdate({_id: req.params.badgeId}, updatedBadge, {new: true});
        return res.status(200).send({
          message: 'Badge updated successfully.',
          badge: newBadge
        });
      }
      else {
        return res.status(200).send({
          message: 'Badge not changed.',
          badge: badge
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Badge not found.',
        badge: badge
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};




/**
 * @api {put} /api/v1/admin/badge/:badgeId/course/:courseId/unassigne/user/:userId Unassigne a Badge
 * @apiName adminUnassigneLocalBadge
 * @apiDescription Unassigne a Badge to an user.
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is unassigned successfully to user.` or `Global Badge is unassigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already unassigned to user."}` or `{"message": "Global Badge is already unassigned to user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
  * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const unassigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var courseId = req.params.courseId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      var course = await Course.findById(courseId);
      if(course){
        var user = await User.findById(userId);
        if(user){
          if(course.localbadge.indexOf(badgeId) > -1){
            // badge is a local badge
            if(user.localbadge.indexOf(badgeId) > -1){
              // badge is not unassigned to user
              user.localbadge.splice(user.localbadge.indexOf(badgeId), 1);
              const updatedUser = await user.save();
              return res.status(200).send({
                message: 'Local Badge is unassigned successfully to user.',
              });
            }
            else{
              return res.status(400).send({
                message: 'Local Badge is already unassigned to user.',
              });
            }
          }
          else {
            // badge is a global badge
            if(user.badge.indexOf(badgeId) > -1){
              // badge is not unassigned to user
              user.badge.splice(user.badge.indexOf(badgeId), 1);
              const updatedUser = await user.save();
              return res.status(200).send({
                message: 'Global Badge is unassigned successfully to user.',
              });
            }
            else{
              return res.status(400).send({
                message: 'Global Badge is already unassigned to user.',
              });
            }
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
          message: 'Course not found.',
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
 * @api {put} /api/v1/admin/badge/:badgeId/course/:courseId/assigne/user/:userId Assigne a Badge
 * @apiName adminAssigneLocalBadge
 * @apiDescription Assigne a Badge to an user.
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} courseId the ID of the course you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is assigned successfully to user.` or `GLobal Badge is assigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already assigned to user."}` or `{"message": "Global Badge is already assigned to user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 404 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const assigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var courseId = req.params.courseId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      var course = await Course.findById(courseId);
      if(course){
        var user = await User.findById(userId);
        if(user){
          if(course.localbadge.indexOf(badgeId) > -1){
            // badge is a local badge
            if(user.localbadge.indexOf(badgeId) < 0){
              // badge is not assigned to user
              user.localbadge.push(badgeId);
              const updatedUser = await user.save();
              return res.status(200).send({
                message: 'Local Badge is assigned successfully to user.',
              });
            }
            else {
              return res.status(400).send({
                message: 'Local Badge is already assigned to user.',
              });
            }
          }
          else {
            // badge is a global badge
            if(user.badge.indexOf(badgeId) < 0){
              // badge is not assigned to user
              user.badge.push(badgeId);
              const updatedUser = await user.save();
              return res.status(200).send({
                message: 'Global Badge is assigned successfully to user.',
              });
            }
            else {
              return res.status(400).send({
                message: 'Global Badge is already assigned to user.',
              });
            }
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
          message: 'Course not found.',
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



module.exports = {
 getBadges,
 postGlobalBadge,
 putBadge,
 assigneBadge,
 unassigneBadge
};
