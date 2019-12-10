// jshint esversion: 8
// jshint node: true
"use strict";

const User = require('../../../../models/user');


/**
 * @api {post} /admin/user/:userId Get one user
 * @apiName getOneUser
 * @apiDescription Get details about one user.
 * @apiGroup Admin
 *
 * @apiParam {String} userId the ID of the user you are referring to.
 *
 * @apiSuccess (Success 200) {String} message `User found successfully.`
 * @apiSuccess (Success 200) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}`
 *
 * @apiError (On error) {String} 404 `{"message": "User not found."}`
 * @apiError (On error) 500 Complications during querying the database
 */
const getOneUser = async function(req, res){
  const userId = req.params.userId;
  try{
    const user = await User.findById(userId, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
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
 * @api {post} /admin/user Get all users
 * @apiName getAllUser
 * @apiDescription Get details about all registered users.
 * @apiGroup Admin
 *
 * @apiSuccess (Success 200) {String} message `All users found successfully.`
 * @apiSuccess (Success 200) {Object} user `[ {"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":"earner", "emailIsConfirmed": false}, {}, ... ]`
 *
 * @apiSuccess (Success 200: no user) {String} message `No user registered.`
 *
 * @apiError (On error) 500 Complications during querying the database
 */
const getAllUser = async function (req, res){
  try{
    const user = await User.find({role: {$in: ['earner', 'issuer']}}, {_id: 0, __v: 0, password: 0, emailConfirmationToken: 0, resetPasswordToken: 0, resetPasswordExpiresIn: 0, refreshToken: 0, refreshTokenExpiresIn: 0});
    if(user){
      return res.status(200).send({
        message: 'All users found successfully.',
        user: user
      });
    }
    return res.status(200).send({
      message: 'No user registered.',
    });
  }
  catch(err){
    return res.status(500).send(err);
  }
};

module.exports = {
  getOneUser,
  getAllUser
};
