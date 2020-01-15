// jshint esversion: 6
// jshint node: true
"use strict";

// validation
const Joi = require('@hapi/joi');

// Example validation
const badgeValidation = data => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    description: Joi.string().min(5),
    image: Joi.string().min(1),
    criteria: Joi.string().min(4),
    criteria: Joi.string().min(4),
    issuer: Joi.string().min(4),
    global: Joi.boolean(),
    exists: Joi.boolean()
  });

  return schema.validate(data);
};


module.exports.badgeValidation = badgeValidation;
