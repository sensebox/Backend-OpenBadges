// jshint esversion: 8
// jshint node: true
"use strict";

const express = require('express');

const mongoose = require('mongoose');

const Badge = require('../../../../models/badge');


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
    query.id=qid
  }
  const badge= new Badge();
  var result = await badge.find(query);

  res.send(result);

};

const postBadge = async function(req, res){
  const course = new Course({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    issuer: req.body.issuer,
    criteria: req.body.criteria,
    image: req.body.image

  });
  res.send("success");
};
module.exports = {
  postBadge,
  getBadge
};
