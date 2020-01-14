// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const Badge = require('../../../../models/badge');
const User = require('../../../../models/user');


/**
 * @api {get} /api/v1/badge Get Badges
 * @apiName getBadges
 * @apiDescription Get (all) Badges by different query.
 * @apiGroup Badge
 *
 * @apiParam {String} [name] find Badges by its name
 * @apiParam {String} [description] find Badges by its description
 * @apiParam {ObejctId} [issuer] the ID of the issuer you are referring to
 * @apiParam {Boolean} [global] if true, get global Badges; if false, get local Badges
 *
 * @apiSuccess (Success 200) {String} message `Badges found successfully.`
 * @apiSuccess (Success 200) {Object} badges `[{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "Badges not found using the specified parameters."}`
 * @apiError (On error) {Object} 404 `{"message": "Badges not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getBadges = async function(req, res){
  var qname  = req.query.name;
  var qdescription = req.query.description;
  var qissuer = req.query.issuer;
  var qglobal = req.query.global;

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
    if(qglobal){
      query.global = qglobal;
    }

    var result = await Badge.find(query);

    if(result.length > 0){
      return res.status(200).send({
        message: 'Badges found succesfully.',
        badges: result
      });
    }
    else {
      if(Object.keys(query).length > 0){
        return res.status(404).send({
          message: 'Badges not found using the specified parameters.',
        });
      }
      else {
        return res.status(404).send({
          message: 'Badges not found.',
        });
      }
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/badge/me Get my Badges
 * @apiName getBadgesMe
 * @apiDescription Get (all) Badges of currently signed in User by different queries.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} [name] find Badges by its name
 * @apiParam {String} [description] find Badges by its description
 * @apiParam {ObejctId} [issuer] find Badges by its issuer
 * @apiParam {Boolean} [global] if true, get global Badges; if false, get local Badges
 *
 * @apiSuccess (Success 200) {String} message `Badges found successfully.`
 * @apiSuccess (Success 200) {Object} badges `[{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true}]`
 *
 * @apiError (On error) {Object} 404 `{"message": "Badges not found using the specified parameters."}`
 * @apiError (On error) {Object} 404 `{"message": "Badges not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getBadgesMe = async function(req, res){
  var qname  = req.query.name;
  var qdescription = req.query.description;
  var qissuer = req.query.issuer;
  var qglobal = req.query.global;

  try{
    // find all badges from current user
    var user = await User.findById(req.user.id, {badge: 1, localbadge: 1, _id: 0});
    var query = {
      $or: [{_id: {$in: user.badge}}, {_id: {$in: user.localbadge}}]
    };
    if(qname){
      query.name = qname;
    }
    if(qdescription){
      query.description=qdescription;
    }
    if(qissuer){
      query.issuer=qissuer;
    }
    if(qglobal){
      query.global = qglobal;
    }

    var result = await Badge.find(query);

    if(result.length > 0){
      return res.status(200).send({
        message: 'Badges found succesfully.',
        badges: result
      });
    }
    else {
      if(Object.keys(query).length > 1){
        return res.status(404).send({
          message: 'Badges not found using the specified parameters.',
        });
      }
      else {
        return res.status(404).send({
          message: 'Badges not found.',
        });
      }
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/badge/:badgeId Get Badge
 * @apiName getBadge
 * @apiDescription Get one Badge by its ObjectId.
 * @apiGroup Badge
 *
 * @apiParam {ObejctId} badgeId the ID of the Badge you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge found successfully.`
 * @apiSuccess (Success 200) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": true, "exists": true}`
 *
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getBadge = async function(req, res){
  try{
    var id = req.params.badgeId;
    var badge = await Badge.findById(id);

    if(badge){
      return res.status(200).send({
        message: 'Badge found succesfully.',
        badge: badge
      });
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
 * @api {post} /api/v1/badge Create local Badge
 * @apiName createLocalBadge
 * @apiDescription Create a new local Badge.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} name title of Badge
 * @apiParam {String} description a brief summary of the Badge
 * @apiParam {String} critera criterias getting this Badge
 *
 * @apiSuccess (Created 201) {String} message `Local Badge is succesfully created.`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": false, "exists": true}`
 *
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const postLocalBadge = async function(req, res){
  try{
    const badge = new Badge({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      description: req.body.description,
      criteria: req.body.criteria,
      issuer: req.user.id
    });
    const savedBadge = await badge.save();
    return res.status(201).send({
      message: 'Local Badge is succesfully created.',
      badge: savedBadge
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {put} /api/v1/badge/:badgeId Change local Badge
 * @apiName putLocalBadge
 * @apiDescription Change information of a local Badge.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {String} [name] title of Badge
 * @apiParam {String} [description] a brief summary of the Badge
 * @apiParam {String} [critera] criterias getting this Badge
 *
 * @apiSuccess (Success 200) {String} message `Local Badge updated successfully.`
 * @apiSuccess (Success 200) {Object} badge `{"name":"name", "issuer": user, "description": "description", "criteria":"criteria", "global": false, "exists": true}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge not changed."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission putting the local Badge."}`
 * @apiError (On error) {Object} 404 `{"message": "Local Badge not found."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const putBadgeLocal = async function(req, res){
  var updatedBadge = {};
  if(req.body.name) updatedBadge.name = req.body.name;
  if(req.body.description) updatedBadge.description = req.body.description;
  if(req.body.criteria) updatedBadge.criteria = req.body.criteria;
  try {
    var badge = await Badge.findById(req.params.badgeId);
    if(badge){
      if(badge.issuer == req.user.id){
        if(Object.keys(updatedBadge).length > 0){
          var newBadge = await Badge.findOneAndUpdate({_id: req.params.badgeId}, updatedBadge, {new: true});
          return res.status(200).send({
            message: 'Local Badge updated successfully.',
            badge: newBadge
          });
        }
        else {
          return res.status(400).send({
            message: 'Local Badge not changed.',
            badge: badge
          });
        }
      }
      else {
        return res.status(403).send({
          message: 'No permission putting the local Badge.',
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Local Badge not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {put} /api/v1/badge/:badgeId/deactivation Deactivate local Badge
 * @apiName putLocalBadgeHidden
 * @apiDescription Deactivate a local Badge.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is successfully deactivated.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge not found."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission deactivating the local Badge."}`
 * @apiError (On error) {Object} 409 `{"message": "Local Badge is already deactivated."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const putBadgeLocalHidden = async function(req, res){
  try{
    var badge = await Badge.findOne({_id: req.params.badgeId});
    if(badge){
      if(badge.issuer == req.user.id){
        if(badge.exists !== false){
          await Badge.updateOne({_id: req.params.badgeId}, {exists: false});
          return res.status(200).send({
            message: 'Local Badge is successfully deactivated.'
          });
        }
        else {
          return res.status(409).send({
            message: 'Local Badge is already deactivated.'
          });
        }
      }
      else {
        return res.status(403).send({
          message: 'No permission deactivating the local Badge.',
        });
      }
    }
    else {
      return res.status(400).send({
        message: 'Local Badge not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};

module.exports = {
  getBadges,
  getBadgesMe,
  getBadge,
  postLocalBadge,
  putBadgeLocal,
  putBadgeLocalHidden
};
