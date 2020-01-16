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
    badge: Joi.array(),
    localbadge: Joy.array(),
    courseprovider: Joi.string().min(1).required(),
    postalcode: Joi.string().min(5).max(5),
    address: Joi.string().min(4),
    //coordinates
    requirements: Joi.string().min(4),
    startdate: Joi.date(),
    enddate: Joi.date(),
    //participants --> ref User
    size: Joi.number().min(1).required(),
    exists: Joi.boolean()
  });

  return schema.validate(data);
};


module.exports.courseValidation = courseValidation;
