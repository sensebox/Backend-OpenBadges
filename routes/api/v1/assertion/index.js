// jshint esversion: 6
// jshint node: true
"use strict";

/**
 * routes/api/v1/assertion/index.js
 * @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
 */

const express = require("express");
const AssertionRouter = express.Router();

AssertionRouter.route("/").get(require("./assertion").getAssertions);
AssertionRouter.route("/:assertionId.json").get(require("./assertion").getAssertionJSON);
AssertionRouter.route("/:assertionId").get(require("./assertion").getAssertion);

module.exports = AssertionRouter;
