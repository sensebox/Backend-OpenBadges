// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');

const Badge = require('../../../../models/badge');

/**
 * @api {get} /badge/findBadge find a Badge by different query
 * @apiName findBadge
 * @apiDescription Find a Badge
 * @apiGroup Badge
 *
 * @apiQuery (Query for filtering Badges) {String} name Name des Badge; find Badge by its name
 * @apiQuery (Query for filtering Badges) {String} description Beschreibung des Badge; find Badge by its description
 * @apiQuery (Query for filtering Badges) {String} issuer Ersteller des  Badges ; find Badge by its issuer
 * @apiQuery (Query for filtering Badges) {String} id id des Badge; find Badge by its id 
 *
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer"= user, "criteria":"criteria", "image":"image"}'
 *
 */

const getBadge = async function(req, res){
  var qname  = req.query.name;
  var qdescription = req.query.description;
  var qissuer = req.query.issuer;
  var qid = req.query.id;

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
  const badge= new Badge();
  var result = await badge.find(query);

  res.send(result);

};
/**
 * @api {post} /badge/createBadge Create Badge
 * @apiName createBadge
 * @apiDescription Create a new Badge
 * @apiGroup Badge
 *
 * @apiParam (Parameters for creating a Badge) {String} name Name des Kurses kann vom Ersteller eingegeben werden; Character String for a Course Name
 * @apiParam (Parameters for creating a Badge) {String} critera Kriterien des Badges die vorrausgesetzt sind; Character String criterias getting this Badge
 * @apiParam (Parameters for creating a Badge) {String} image Image wird als String gespeichert ; Character String image values getting saved as String in mongo but might be rendered on site
 *
 * @apiSuccess (Created 201) {String} message `success`
 * @apiSuccess (Created 201) {Object} badge `{"name":"name", "issuer"= user, "criteria":"criteria", "image":"image"}'
 *
 */
const postBadge = async function(req, res){
  const badge = new Badge({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    issuer: req.body.issuer,
    criteria: req.body.criteria,
    image: req.body.image

  });
  badge.save();
  res.send("success");
};
module.exports = {
  postBadge,
  getBadge
};
