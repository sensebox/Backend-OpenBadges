// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const bcrypt = require("bcryptjs");

const Assertion = require("../../../../models/assertion");
const User = require("../../../../models/user");
const IdentityObject = require("../../../../models/identityObject");

const getAssertions = async function (req, res) {
  try {
    var assertions = await Assertion.find();

    if (assertions) {
      return res.status(200).send({
        message: "Assertions found succesfully.",
        assertions: assertions,
      });
    } else {
      return res.status(404).send({
        message: "Assertions not found.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

/**
 * @api {get} /api/v1/assertion/:badgeId Get Assertion
 * @apiName getBadge
 * @apiDescription Get one Badge by its ObjectId.
 * @apiGroup Badge
 *
 * @apiParam {ObejctId} badgeId the ID of the Badge you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge found successfully.`
 * @apiSuccess (Success 200) {Object} badge `{"name":"name", "issuer": user, "requestor": [], "description": "description", "criteria":"criteria", "category": "achievement", "exists": true, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getAssertion = async function (req, res) {
  try {
    var id = req.params.assertionId;
    var assertion = await Assertion.findById(id);

    if (assertion) {
      return res.status(200).send({
        message: "Assertion found succesfully.",
        badge: assertion,
      });
    } else {
      return res.status(404).send({
        message: "Assertion not found.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

const getAssertionJSON = async function (req, res) {
  try {
    var id = req.params.assertionId;
    var assertion = await Assertion.findById(id);

    if (assertion) {

        const user = await User.findById(assertion.recipient);
        console.log(user)

        const salt = await bcrypt.genSalt(10);
        const identityHash = await bcrypt.hash(user.email, salt);

        const userIdentityObject = new IdentityObject({
            identity: identityHash,
            hashed: true,
            salt
        })

      return res.status(200).send({
        ...assertion.toObject(), //https://stackoverflow.com/a/48014589/5660646
        "@context": "https://w3id.org/openbadges/v2",
        id: `https://${process.env.APP_HOST}/api/v1/assertion/${id}.json`,
        recipient: userIdentityObject,
        badge: `https://${process.env.APP_HOST}/api/v1/badge/${assertion.badge}.json`,
      });
    } else {
      return res.status(404).send({
        message: "Assertion not found.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

module.exports = {
  getAssertions,
  getAssertion,
  getAssertionJSON,
};
