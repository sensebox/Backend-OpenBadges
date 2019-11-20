// jshint esversion: 8
// jshint node: true
"use strict";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
const passport = require('passport');

var app = express();

//reads in configuration from a .env file
require('dotenv').config();


function connectMongoDB() {
  (async () => {
    // set up default ("Docker") mongoose connection
    await mongoose.connect('mongodb://localhost:27017/openBadges', {
      useNewUrlParser: true,
      useCreateIndex: true,
      autoReconnect: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }).then(db => {
      console.log('Connected to MongoDB (databasename: "'+db.connections[0].name+'") on host "'+db.connections[0].host+'" and on port "'+db.connections[0].port+'""');
    }).catch(err => {
        console.log('Error at MongoDB-connection: '+err);
        console.log('Retry to connect in 3 seconds');
        setTimeout(connectMongoDB, 3000); // retry until db-server is up
      });
  })();
}
// connect to MongoDB
connectMongoDB();


// imports our configuration file which holds our verification callbacks and things like the secret for signing.
require('./config/passport')(passport);
// initializes the passport configuration.
app.use(passport.initialize());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
// make packages available for client using statics
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));


// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var secretRouter = require('./routes/secret');
//
// app.use('/', indexRouter);
// app.use('/user', usersRouter);
// app.use('/secret', passport.authenticate('jwt', {failureRedirect: '/user/login', session: false}), secretRouter);

// setup routes
// @see https://medium.com/@sesitamakloe/how-we-structure-our-express-js-routes-58933d02e491
require('./routes')(app);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
