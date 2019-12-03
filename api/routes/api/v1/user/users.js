// jshint esversion: 8
// jshint node: true
"use strict";

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const moment = require('moment');

const User = require('../../../../models/user');
const {registerValidation, loginValidation} = require('../../../../config/validation');
const {createToken, isTokenValid, invalidateToken} = require('../../../../helper/jwt');
const {hashJWT} = require('../../../../helper/refreshToken');


/**
 * @api {post} /user/signup Sign up
 * @apiName signUp
 * @apiDescription Sign up a new OpenBadges-user.
 * @apiGroup User
 *
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} firstname Name the full first name of the user; must consist of at least 6 characters
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} lastname Name the full last name of the user; must consist of at least 6 characters
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} city the user's place of residence; must consist of at least 2 characters
 * @apiParam (Parameters for creating a new OpenBadges-user) {Number} postalcode the postal code of the user's place of residence; minimum 01067, maximal 99998
 * @apiParam (Parameters for creating a new OpenBadges-user) {Date} birthday the birthday of the user
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} email the email for the user
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} username the username for the user; it is used for signing in
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} password the desired password for the user; must consist of at least 6 characters
 * @apiParam (Parameters for creating a new OpenBadges-user) {String} confirmPassword confirm the desired password for the user; must consist the same string as password
 *
 * @apiSuccess (Created 201) {String} message `User is successfully registered`
 * @apiSuccess (Created 201) {Object} user `{"firstname":"full firstname", "lastname":"full lastname", "city":"cityname", "postalcode":"123456", "birthday":"ISODate("1970-12-01T00:00:00Z")", "email":"test@test.de", "username":"nickname", "role":["earner"]}`
 *
 * @apiError (Error 4xx) {String} 400 `{"error": <Passed parameters are not valid>}`
 * @apiError (Error 4xx) {String} 409 `{"error": "Email already exists"}` or `{"error": "Username already exists"}`
 * @apiError (Error 5xx) 500 Complications during storage
 */
const postRegister = async function(req, res){
  // validate incoming data
  const {error} = registerValidation(req.body);
  if(error) return res.status(400).send({error: error.details[0].message});
  // checking if user is already in db
  const emailExists = await User.findOne({email: req.body.email});
  if(emailExists) return res.status(409).send({error: 'Email already exists'});
  const usernameExists = await User.findOne({username: req.body.username});
  if(usernameExists) return res.status(409).send({error: 'Username already exists'});
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  // create a new user
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    email: req.body.email,
    birthday: new Date(req.body.birthday),
    city: req.body.city,
    postalcode: req.body.postalcode,
    username: req.body.username,
    password: hashedPassword
  });
  try{
    const savedUser = await user.save();
    return res.status(201).send({
      message: 'User is successfully registered',
      user: {
        firstname: savedUser.firstname,
        lastname: savedUser.lastname,
        city: savedUser.city,
        postalcode: savedUser.postalcode,
        birthday: savedUser.birthday,
        email: savedUser.email,
        username: savedUser.username,
        role: savedUser.role
      }
    });
  }
  catch(err) {
    return res.status(500).send(err);
  }
};

/**
 * @api {post} /user/signin Sign in
 * @apiName signIn
 * @apiDescription Sign in the user.
 * @apiGroup User
 *
 * @apiParam {String} username the username of the user
 * @apiParam {String} password the password of the user
 *
 * @apiSuccess (Success 200) {String} message `User is successfully registered`
 * @apiSuccess (Success 200) {String} token valid JSON Web Token
 * @apiSuccess (Success 200) {String} refreshToken valid refresh token
 *
 * @apiError (Error 4xx) {String} 403 `{"error": "Email or password is wrong"}`
 * @apiError (Error 5xx) 500 Complications during querying the database or creating a JWT
 */
const postLogin = async function(req, res){
  // // validate incoming login-data
  // const {error} = loginValidation(req.body);
  // if(error) return res.status(400).send({error: error.details[0].message});
  try{
    // checking if the email exists
    const user = await User.findOne({username: req.body.username});
    if(!user) return res.status(403).send({error:'Email or password is wrong'});
    // checking if password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(403).send({error:'Email or password is wrong'});
    // create JWT-Token and refresh-Token
    const {token: token, refreshToken: refreshToken } = await createToken(user);
    return res.status(200).send({
      message: 'User successfully signed in',
      token: token,
      refreshToken: refreshToken
    });
  }
  catch(err) {
    return res.status(500).send(err);
  }
};

/**
 * @api {post} /user/refreshToken Refresh token
 * @apiName refreshToken
 * @apiDescription Refresh the authorization, if the refresh token is valid.
 * @apiGroup User
 *
 * @apiParam {String} refreshToken the refresh token
 *
 * @apiSuccess (Success 200) {String} message `Authorization successfully refreshed`
 * @apiSuccess (Success 200) {String} token valid JSON Web Token
 * @apiSuccess (Success 200) {String} refreshToken valid refresh token
 *
 * @apiError (Error 4xx) {String} 403 `{"message": "Refresh token is invalid or too old. Please sign in with your user credentials."}`
 * @apiError (Error 5xx) 500 Complications during querying the database or creating a JWT.
 */
const postRefreshToken = async function(req, res){
  var refreshToken = req.body.refreshToken;
  try{
    const user = await User.findOne({refreshToken: refreshToken, refreshTokenExpiresIn: { $gte: moment.utc().toDate() } });
    if (!user) {
      return res.status(403).send({
        message: 'Refresh token is invalid or too old. Please sign in with your user credentials.'
      });
    }
    else {
      // invalidate old token
      invalidateToken(refreshToken);
      // create JWT-Token and refresh-Token
      const {token: token, refreshToken: newRefreshToken } = await createToken(user);
      return res.status(200).send({
        message: 'Authorization successfully refreshed',
        token: token,
        refreshToken: newRefreshToken
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


/**
 * @api {post} /user/signout Sign out
 * @apiName signOut
 * @apiGroup User
 * @apiDescription Signs the user out, if JSON Web Token is valid. Invalidates the current JSON Web Token.
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0ODMwMDYxNTIsImV4cCI6MTQ4MzAwOTc1MiwiaXNzIjoibG9jYWxob3N0OjgwMDAiLCJzdWIiOiJ0ZXN0QHRlc3QuZGUiLCJqdGkiOiJmMjNiOThkNi1mMjRlLTRjOTQtYWE5Ni1kMWI4M2MzNmY1MjAifQ.QegeWHWetw19vfgOvkTCsBfaSOPnjakhzzRjVtNi-2Q
 *
 * @apiSuccess (Success 200) {String} message `Signed out successfully`
 *
 * @apiError (Error 4xx) {String} 403 `{"message": "JSON Web Token is invalid. Please sign in with your user credentials."}`
 * @apiError (Error 5xx) 500 Complications during querying the database or creating a JWT.
 */
// access only if user is authenticated
const postLogout = async function(req, res){
  const refreshToken = req.query.refreshToken;
  const rawAuthorizationHeader = req.header('authorization');
  const [, token] = rawAuthorizationHeader.split(' ');
  try {
    // invalidate JWT
    await invalidateToken(token);
    await User.updateOne({_id: req.user.id}, {refreshToken: '', refreshTokenExpiresIn: moment.utc().subtract(1, 'h').toDate()});
    res.status(200).send({
      message: 'Signed out successfully'});
  }
  catch(err){
    res.status(500).send(err);
  }
};

module.exports = {
  postRegister,
  postLogin,
  postRefreshToken,
  postLogout
};
