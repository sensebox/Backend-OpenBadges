// jshint esversion: 8
// jshint node: true
"use strict";

const User = require('../../../../models/user');


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
 * @apiSuccess (Success 200) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}`
 *
 * @apiError (On error) {Obejct} 404 `{"message": "User not found."}`
 * @apiError (On error) {Obejct} 500 Complications during querying the database.
 */
const getMe = async function(req, res){
  var id;
  if(req.user) id = req.user.id;
  try{
    const user = await User.findById(id, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
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
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} [lastname] Name the new full last name of the user; must consist of at least 6 characters
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} [city] the user's new place of residence; must consist of at least 2 characters
 * @apiParam (Parameters for creating a new OpenBadges-user) {Number} [postalcode] the new postal code of the user's place of residence; minimum 01067, maximal 99998
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} [email] the new email of the user
 *
 * @apiSuccess (Success 200) {String} message `User information updated successfully.`
 * @apiSuccess (Success 200) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}`
 *
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Obejct} 500 Complications during querying the database.
 */
const putMe = async function(req, res){
  var updatedUser = {};
  if(req.body.lastname) updatedUser.lastname = req.body.lastname; // in case of marriage
  if(req.body.email) updatedUser.email = req.body.email;
  if(req.body.city) updatedUser.city = req.body.city;
  if(req.body.postalcode) updatedUser.postalcode = req.body.postalcode;
  try{
    var user = await User.findOneAndUpdate({_id: req.user.id}, updatedUser, {new: true});
    if(user){
      // {"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}`
      user = {
        firstname: user.firstname,
        lastname: user.lastname,
        city: user.city,
        postalcode: user.postalcode,
        birthday: user.birthday,
        email: user.email,
        username: user.username,
        role: user.role,
        emailIsConfirmed: user.emailIsConfirmed
      };

      return res.status(200).send({
        message: 'User information updated successfully.',
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
 * @api {delete} /api/v1/user/me Delete me
 * @apiName deleteMe
 * @apiDescription Delete the user-account of currently logged in user.
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




module.exports = {
  getMe,
  putMe,
  deleteMe
};
