// jshint esversion: 8
// jshint node: true
"use strict";

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../../../../models/user');
const {registerValidation, loginValidation} = require('../../../../config/validation');



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
    date: Date.now(),
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

  // create and assign a token if everything is fine
  const payload = {id: user._id};
  const options = {expiresIn: process.env.JWT_expiresIn};

  try{
    const token = jwt.sign(payload, process.env.JWT_Token, options);
    return res.status(200).send({token: token});
  }
  catch(err) {
    return res.status(400).send(err);
  }
};


const passport = require('passport');
const invalidateJWT = require('../../../../helper/jwt');
const TokenBlacklist = require('../../../../models/tokenBlacklist');

// access only if user is authenticated
const getLogout = async function(req, res){
// router.get('/logout', passport.authenticate('jwt', {failureRedirect: '/user/login', session: false}), async (req, res) => {
  const rawAuthorizationHeader = req.header('authorization');
  const [, token] = rawAuthorizationHeader.split(' ');
  try {
    // invalidateJWT(token);
    console.log('logoutToken', token);
    var newBlacklistedToken = new TokenBlacklist({
        token: token
    });
    var invalidToken = await newBlacklistedToken.save();
    res.status(200).send({invalidToken: invalidToken, message: 'Logged out successfully'});
  }
  catch(err){
    res.status(400).send('Error while logging out');
  }
};

module.exports = {
  postRegister,
  postLogin,
  getLogout
};
