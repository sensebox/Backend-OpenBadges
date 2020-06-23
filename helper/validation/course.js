// jshint esversion: 6
// jshint node: true
"use strict";

// validation
const Joi = require('@hapi/joi');

// Example validation
const courseValidation = data => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    /// bei referenzen testen auf Länge und Art (zb. String ertc)
    //badges local and global
    //creator --> User
    badge: Joi.array().required(),
    courseprovider: Joi.string().min(1).required(),
    postalcode: Joi.string().min(5).max(5),
    address: Joi.string().min(4),
    coordinates: Joi.array(),
    requirements: Joi.string().min(4).required(),
    startdate: Joi.date().required(),
    enddate: Joi.date().required(),
    //participants --> ref User
    size: Joi.number().min(1).required(),
    topic: Joi.string().min(4).required(),
    description: Joi.string().min(4).required()
  });

  return schema.validate(data);
};


module.exports.courseValidation = courseValidation;
