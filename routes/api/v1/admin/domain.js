// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Domain = require('../../../../models/domain');

/**
 * @api {post} /api/v1/admin/domain Allow domain
 * @apiName adminPostDomain
 * @apiDescription Add domain to collection, which can access specific routes.
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} domain name of the domain, e.g. http://localhost:3000
 * @apiParam {String} description further information about the domain
 *
 * @apiSuccess (Success 200) {String} message `Domain is successfully added.`
 * @apiSuccess (Success 200) {Object} domain `{"domain":"http://localhost:3000", "description": "further information", "access": String}`
 *
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const postDomain = async function(req, res){
  try {
    // if(req.fileValidationError){
    //   return res.status(422).send({message: req.fileValidationError});
    // }
    const id = new mongoose.Types.ObjectId();
    const payload = {id: id};
    const token = await jwt.sign(payload, process.env.JWT_Token_Secret, {});
    const body = {
      _id: id,
      name: req.body.domain,
      description: req.body.description
    };
    const domain = new Domain(body);
    const savedDomain = await domain.save();
    return res.status(201).send({
      message: 'Domain is successfully added.',
      domain: domain,
      token: token
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};

/**
 * @api {delete} /api/v1/admin/domain/domainId Ban domain
 * @apiName adminDeleteDomain
 * @apiDescription Ban domain from collection, which can access specific routes.
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} domainId the ID of the Domain you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Domain deleted successfully.`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const deleteDomain = async function(req, res){
  try {
    // if(req.fileValidationError){
    //   return res.status(422).send({message: req.fileValidationError});
    // }
    var domain = await Domain.deleteOne({_id: req.params.domainId});
    if(domain && domain.deletedCount > 0){
      return res.status(200).send({
        message: 'Domain deleted successfully.',
      });
    }
    return res.status(404).send({
      message: 'Domain not found.',
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/admin/domain Get all domains
 * @apiName adminGetDomains
 * @apiDescription Get domains, which can access specific routes.
 * @apiGroup Admin
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `Domain found successfully.`
 * @apiSuccess (Success 200) {Object} domain `{"domain":"http://localhost:3000", "description": "further information"}`
 *
 * @apiError (On error) {Object} 500 Complications during storage.
 */
const getDomains = async function(req, res){
  try {
    // if(req.fileValidationError){
    //   return res.status(422).send({message: req.fileValidationError});
    // }
    var domains = await Domain.find({});
    return res.status(200).send({
      message: 'Domain found successfully.',
      domains: domains
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


module.exports = {
 postDomain,
 deleteDomain,
 getDomains
};
