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


const postRegister = async function(req, res){
// router.post('/register', async (req, res) => {
  // validate incoming data
  const {error} = registerValidation(req.body);
  if(error) return res.status(400).send({error: error.details[0].message});
  // checking if user is already in db
  const emailExists = await User.findOne({email: req.body.email});
  if(emailExists) return res.status(400).send({error: 'Email already exists'});
  const usernameExists = await User.findOne({username: req.body.username});
  if(usernameExists) return res.status(400).send({error: 'Username already exists'});
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // create a new user
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    email: req.body.email,
    username: req.body.username,
    password: hashedPassword,
  });
  try{
    const savedUser = await user.save();
    return res.status(200).send({user: savedUser});
  }
  catch(err) {
    return res.status(400).send(err);
  }
};


const postLogin = async function(req, res){
// router.post('/login', async (req, res) => {
  // validate incoming login-data
  const {error} = loginValidation(req.body);
  if(error) return res.status(400).send({error: error.details[0].message});
  // checking if the email exists
  const user = await User.findOne({username: req.body.username});
  if(!user) return res.status(400).send({error:'Email or password is wrong'});
  // checking if password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!validPassword) return res.status(400).send({error:'Email or password is wrong'});

  try{
    // create JWT-Token and refresh-Token
    const {token: token, refreshToken: refreshToken } = await createToken(user);
    return res.status(200).send({token: token, refreshToken: refreshToken});
  }
  catch(err) {
    return res.status(400).send(err);
  }
};


const postRefreshToken = async function(req, res){
  var refreshToken = req.body.refreshToken;
  const user = await User.findOne({refreshToken: refreshToken, refreshTokenExpiresIn: { $gte: moment.utc().toDate() } });

  if (!user) {
    return res.status(401).send('Refresh token invalid or too old. Please sign in with your username and password.');
  }
  else {
    try{
      // invalidate old token
      invalidateToken(refreshToken);
      // create JWT-Token and refresh-Token
      const {token: token, refreshToken: newRefreshToken } = await createToken(user);
      return res.status(200).send({token: token, refreshToken: newRefreshToken, user});
    }
    catch(err){
      return res.status(400).send('Error refreshing token');
    }
  }
};



// access only if user is authenticated
const getLogout = async function(req, res){
  const refreshToken = req.query.refreshToken;
  const rawAuthorizationHeader = req.header('authorization');
  const [, token] = rawAuthorizationHeader.split(' ');
  try {
    // var hashToken = hashJWT(token);
    // invalidate JWT
    await invalidateToken(token);
    // invalidate JWT
    await User.updateOne({_id: req.user.id}, {refreshToken: '', refreshTokenExpiresIn: moment.utc().subtract(1, 'h').toDate()});
    res.status(200).send('Logged out successfully');
  }
  catch(err){
    res.status(400).send('Error while logging out');
  }
};

module.exports = {
  postRegister,
  postLogin,
  postRefreshToken,
  getLogout
};
