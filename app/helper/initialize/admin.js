// jshint esversion: 6
// jshint node: true
"use strict";

const request = require('request');
const chalk = require('chalk');


const createAdmin = function(cb){

  const options = {
    url: process.env.API_Domain + '/api/v1/admin/signup',
    form: {
      lastname: 'Bartoschek',
      firstname: 'Thomas',
      email: 'OpenBadges@gmx.de',
      birthday: '01-01-1985',
      city: 'Münster',
      postalcode: '48159',
      username: 'admin',
      password: 'admin123',
      confirmPassword: 'admin123'
    }
  };
  request.post(options)
    .on('response', function(response) {
      // concatenate updates from datastream
      var body = '';
      response.on('data', function(chunk){
          //console.log("chunk: " + chunk);
          body += chunk;
      });
      response.on('end', function(){
        if(response.statusCode !== 201){
          console.log(body);
          if(!(JSON.parse(body).message === 'Email already exists')){
            return console.log(chalk.red('Error'));
          }
          console.log(chalk.yellow.inverse(JSON.stringify({
            message: 'Admin already signed up',
            loginData: {
              username: options.form.username,
              password: options.form.password
            }
          })));
        }
        else {
          console.log(chalk.yellow.inverse(body));
        }
        if(cb) return cb();
      });
    })
    .on('error', function(err) {
      return console.log(chalk.red(err));
  });
};



module.exports = {
  createAdmin
};
