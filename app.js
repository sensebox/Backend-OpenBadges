// jshint esversion: 8
// jshint node: true
"use strict";

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');



var app = express();


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


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var pictureRouter = require('./routes/picture');


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/picture', pictureRouter);


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
