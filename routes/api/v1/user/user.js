// jshint esversion: 8
// jshint node: true
"use strict";

const User = require('../../../../models/user');
const Project = require('../../../../models/user');

const fs = require('fs');
const path = require('path');

/**
 * @api {get} /api/v1/user/me Get details
 * @apiName getMe
 * @apiDescription Get details about currently logged in user.
 * @apiGroup User
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `User found successfully.`
 * @apiSuccess (Success 200) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Obejct} 404 `{"message": "User not found."}`
 * @apiError (On error) {Obejct} 500 Complications during querying the database.
 */
const getMe = async function(req, res){
  var id;
  if(req.user) id = req.user.id;
  try{
    const user = await User.findById(id, {__v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
    if(user){
      return res.status(200).send({
        message: 'User found successfully.',
        user: user
      });
    }
    return res.status(404).send({
      message: 'User not found.',
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {put} /api/v1/user/me Change information
 * @apiName putMe
 * @apiDescription Update the information about currently logged in user.
 * @apiGroup User
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} [lastname] Name the new full last name of the user; must consist of at least 6 characters
 * @apiParam {String} [city] the user's new place of residence; must consist of at least 2 characters
 * @apiParam {Number} [postalcode] the new postal code of the user's place of residence; minimum 01067, maximal 99998
 * @apiParam {String} [email] the new email of the user
 * @apiParam {File} [profile] image-File (Only images with extension 'PNG', 'JPEG', 'JPG' and 'GIF' are allowed.)
 *
 * @apiSuccess (Success 200) {String} message `User information updated successfully.` or </br> `User information not changed.`
 * @apiSuccess (Success 200) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false, "image": {"path": <String>, "size": <Number>, "contentType": "image/jpeg", "originalName": "originalName.jpeg"}}`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Obejct} 500 Complications during querying the database.
 */
const putMe = async function(req, res){
  try{
    if(req.fileValidationError){
      return res.status(422).send({message: req.fileValidationError});
    }
    var user = await User.findById(req.user.id);
    if(user){
      var updatedUser = {};
      if(req.body.lastname){
        if(req.body.lastname != user.lastname){
          updatedUser.lastname = req.body.lastname;// in case of marriage
      }}
      if(req.body.email){
        if(req.body.email != user.email){
          updatedUser.email = req.body.email;
      }}
      if(req.body.city){
        if(req.body.city != user.city){
          updatedUser.city = req.body.city;
      }}
      if(req.body.postalcode){
        if(req.body.postalcode != user.postalcode){
          updatedUser.postalcode = req.body.postalcode;
      }}
      if(req.file){
        const image = {
          path: req.file.filename,
          size: req.file.size,
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
        };
        if(user.image.path){
          fs.unlink(path.join(__dirname, '..', '..', '..', '..', 'upload', user.image.path), function(err) {
            // if(err && err.code == 'ENOENT') {
            //   // file doens't exist
            //   console.info("File doesn't exist, won't remove it.");
            // } else if (err) {
            //   // other errors, e.g. maybe we don't have enough permission
            //   console.error("Error occurred while trying to remove file");
            // } else {
            //   console.info(`removed`);
            // }
          });
        }
        updatedUser.image = image;
      }

      if(Object.keys(updatedUser).length > 0){
        var newUser = await User.findOneAndUpdate({_id: req.user.id}, updatedUser, {new: true});
        const {_doc, ...rest} = newUser;
        const {__v, password, emailConfirmationToken, resetPasswordToken, resetPasswordExpiresIn, refreshToken, refreshTokenExpiresIn, ...restUser} = _doc;
        return res.status(200).send({
          message: 'User information updated successfully.',
          user: restUser
        });
      }
      else {
        const {_doc, ...rest} = user;
        const {__v, password, emailConfirmationToken, resetPasswordToken, resetPasswordExpiresIn, refreshToken, refreshTokenExpiresIn, ...restUser} = _doc;
        return res.status(200).send({
          message: 'User information not changed.',
          user: restUser
        });
      }
    }
    return res.status(404).send({
      message: 'User not found.',
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {delete} /api/v1/user/me Delete me
 * @apiName deleteMe
 * @apiDescription Delete the user-account and every dependent project  of currently logged in user (exists to false).
 * @apiGroup User
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `User deleted successfully.`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Obejct} 500 Complications during querying the database.
 */
const deleteMe = async function(req, res){
  var id;
  if(req.user) id = req.user.id;
  try{
    await Project.updateMany({participants: {$in: req.user.id}}, {$set: {participants: {$pull: req.user.id}}});
    await Project.updateMany({creator: req.user.id}, {$set: {exists: false}});
    // badges are only connected to user, if user is deleted, every dependecy is also deleted
    var user = await User.deleteOne({_id: id});
    if(user && user.deletedCount > 0){
      return res.status(200).send({
        message: 'User deleted successfully.',
      });
    }
    return res.status(404).send({
      message: 'User not found.',
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {get} /api/v1/user Get user names
 * @apiName getSomeUsers
 * @apiDescription Get names about part of registered users.
 * @apiGroup User
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {String} lastname
 * @apiParam {Number} [limit] limits the result, maximum are 10 returned items
 *
 * @apiSuccess (Success 200) {String} message `Users found successfully.`
 * @apiSuccess (Success 200) {Object} users `[{"firstname":"full firstname", "lastname":"full lastname", "_id": <ObjectId>}]`
 *
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const getSomeUsers = async function (req, res){
  try{
    console.log(req.query);
    var limit = 10;
    if(req.query.limit && Number(req.query.limit) < 10) limit = Number(req.query.limit);
    const user = await User.find({lastname: {$regex: req.query.lastname, $options: 'i'}}, {__v:0, username:0, image:0, role:0, emailIsConfirmed:0, date:0, badge:0, email:0, birthday:0, postalcode:0, city:0, password:0, emailConfirmationToken:0, resetPasswordToken:0, resetPasswordExpiresIn:0, refreshToken:0, refreshTokenExpiresIn:0})
                           .limit(limit);
    return res.status(200).send({
      message: 'Users found successfully.',
      users: user
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};




module.exports = {
  getMe,
  putMe,
  deleteMe,
  getSomeUsers
};
