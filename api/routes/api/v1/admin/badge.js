// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const Badge = require('../../../../models/badge');
const User = require('../../../../models/user');
const Course = require('../../../../models/course');


/**
 * @api {get} /admin/badge Get Badges
 * @apiName adminFindBadge
 * @apiDescription Get (all) Badges by different query.
 * @apiGroup Admin
 *
 * @apiParam (Query for filtering Badges) {String} [name] find Badges by its name
 * @apiParam (Query for filtering Badges) {String} [description] find Badges by its description
 * @apiParam (Query for filtering Badges) {ObejctId} [issuer] find Badges by its issuer
 * @apiParam (Query for filtering Badges) {ObejctId} [id] find Badges by its id
 * @apiParam (Query for filtering Badges) {ObejctId} [userId] find Badges of an user
 * @apiParam (Query for filtering Badges) {Boolean} [global] find global Badges or local Badges
 *
 * @apiSuccess (Success 200) {String} message `Badge found successfully.`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer"= user, "criteria":"criteria", "image":"image"}'
 *
 * @apiError (On error) {String} 404 `{"message": "User not found."}`
 * @apiError (On error) 500 Complications during querying the database
 */
const getBadges = async function(req, res){
  var qname  = req.query.name;
  var qdescription = req.query.description;
  var qissuer = req.query.issuer;
  var qid = req.query.id;
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
      var user = User.findById(quserId).select('badge', 'localbadge');
      if(user){
        query._id = {$or: [{$in: user.badge}, {$in: user.localbadge}]};
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
 * @api {post} /admin/badge Create global Badge
 * @apiName createGlobalBadge
 * @apiDescription Create a new global Badge.
 * @apiGroup Admin
 *
 * @apiParam (Parameters for creating a global Badge) {String} name title of Badge
 * @apiParam (Parameters for creating a global Badge) {String} description a brief summary of the Badge
 * @apiParam (Parameters for creating a global Badge) {String} critera criterias getting this Badge
 *
 * @apiSuccess (Created 201) {String} message `Global Badge is succesfully created.`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true}'
 *
 * @apiError (On error) {Object} 500 `{"message": "Complications during storage."}`
 */
const postGlobalBadge = async function(req, res){
  try{
    const badge = new Badge({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      description: req.body.description,
      criteria: req.body.criteria,
      issuer: req.user.id,
      global: true
    });
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
 * @api {post} /admin/badge/:badgeId Put Badge
 * @apiName AdminPutBadge
 * @apiDescription Put a Badge (global | local).
 * @apiGroup Admin
 *
 * @apiParam (Parameters for putting a global Badge) {String} [name] title of Badge
 * @apiParam (Parameters for putting a global Badge) {String} [description] a brief summary of the Badge
 * @apiParam (Parameters for putting a global Badge) {String} [critera] criterias getting this Badge
 * @apiParam (Parameters for putting a global Badge) {Boolean} [exists] if false, badge is deactivated
 *
 * @apiSuccess (Success 200) {String} message `Badge updated successfully.`
 * @apiSuccess (Success 200) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true}'
 *
 * @apiError (On error) {Object} 400 `{"message": "Badge not changed."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during storage."}`
 */
const putBadge = async function(req, res){
  var updatedBadge = {};
  if(req.body.name) updatedBadge.name = req.body.name;
  if(req.body.description) updatedBadge.description = req.body.description;
  if(req.body.criteria) updatedBadge.criteria = req.body.criteria;
  if(req.body.exists) updatedBadge.exists = req.body.exists;
  try {
    var badge = await Badge.findById(req.params.badgeId);
    if(badge){
      if(Object.keys(updatedBadge).length > 0){
        var newBadge = await Badge.findOneAndUpdate({_id: req.params.badgeId}, updatedBadge, {new: true});
        return res.status(200).send({
          message: 'Badge updated successfully.',
          badge: newBadge
        });
      }
      else {
        return res.status(400).send({
          message: 'Badge not changed.',
          badge: badge
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
 * @api {put} /admin/badge/:badgeId/unassigne/user/:userId unassigne a Badge
 * @apiName adminUnassigneLocalBadge
 * @apiDescription unassigne a Badge to an user
 * @apiGroup Admin
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is unassigned successfully to user.` or `Global Badge is unassigned successfully to user.`
 * @apiSuccess (Success 200) {Object} user `{...}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already unassigned to user."}` or `{"message": "Global Badge is already unassigned to user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
  * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during querying the database."}`
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
                user: updatedUser
              });
            }
            else{
              return res.status(400).send({
                message: 'Local Badge is already unassigned to user.',
                user: user
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
                user: updatedUser
              });
            }
            else{
              return res.status(400).send({
                message: 'Global Badge is already unassigned to user.',
                user: user
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
 * @api {put} /admin/badge/:badgeId/course/:courseId/assigne/user/:userId assigne a Badge
 * @apiName adminAssigneLocalBadge
 * @apiDescription assigne a Badge to an user
 * @apiGroup Admin
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is assigned successfully to user.` or `GLobal Badge is assigned successfully to user.`
 * @apiSuccess (Success 200) {Object} user `{...}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already assigned to user."}` or `{"message": "Global Badge is already assigned to user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 404 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during querying the database."}`
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
                user: updatedUser
              });
            }
            else {
              return res.status(400).send({
                message: 'Local Badge is already assigned to user.',
                user: user
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
                user: updatedUser
              });
            }
            else {
              return res.status(400).send({
                message: 'Global Badge is already assigned to user.',
                user: user
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
