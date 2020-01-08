// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const Badge = require('../../../../models/badge');
const User = require('../../../../models/user');


/**
 * @api {get} /badge Get Badges
 * @apiName findBadge
 * @apiDescription Get (all) Badges by different query.
 * @apiGroup Badge
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
const getBadge = async function(req, res){
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
 * @api {post} /badge Create Badge
 * @apiName createBadge
 * @apiDescription Create a new Badge.
 * @apiGroup Badge
 *
 * @apiParam (Parameters for creating a Badge) {String} name Character String for a Course Name
 * @apiParam (Parameters for creating a Badge) {String} critera Character String criterias getting this Badge
 * @apiParam (Parameters for creating a Badge) {String} image Character String image values getting saved as String in mongo but might be rendered on site
 *
 * @apiSuccess (Created 201) {String} message `Badge created succesfully.`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer": userId, "criteria":"criteria", "image":"image"}'
 *
 * @apiError (On error) 500 Complications during querying the database
 */
const postBadge = async function(req, res){
  try{
    const badge = new Badge({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      issuer: req.body.issuer,
      criteria: req.body.criteria,
      image: req.body.image
    });
    badge.save();
    return res.status(201).send({
      message: 'Badge created succesfully.',
      badge: badge
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};



module.exports = {
  postBadge,
  getBadge
};
