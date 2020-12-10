// jshint esversion: 8
// jshint node: true
"use strict";

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const MultipleUser = require('../../../../models/multipleUser');
const User = require('../../../../models/user');

/**
 * @api {post} /api/v1/teacher/users Create users
 * @apiName teacherCreateUsers
 * @apiDescription Sign up new (multiple) OpenBadges-Users.
 * @apiGroup Teacher
 *
 * @apiParam {String} count number of accounts to create
 *
 * @apiSuccess (Created 201) {String} message `Users are successfully registered.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Count has to be a positive number."}`
 * @apiError (On error) {Object} 500 Complications during storage
 */
const postUsersRegister = async function(req, res){
  try{
    // validate incoming data
    // if(req.fileValidationError){
    //   return res.status(422).send({message: req.fileValidationError});
    // }
    // const {error} = registerValidation(req.body);
    // if(error) return res.status(422).send({message: error.details[0].message});
    if(req.body.count && parseInt(req.body.count) > 0){
      var usernameNumber = 0;
      var users = await MultipleUser.find({username: { $regex: /^username[0-9]{1,}$/, $options: 'g' }});
      var usernameNumbers = users.map(user => parseInt(user.username.replace('username','')));
      if(usernameNumbers.length > 0){
        usernameNumber = Math.max(...usernameNumbers);
      }
      var newUsernameNumber = usernameNumber + 1;
      var newUsers = [];
      for(var i = 0; i < req.body.count; i++){
        // create code (6 letters)
        const password = Math.random().toString(36).substring(7);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const username = `username${newUsernameNumber}`;
        const newUser = new MultipleUser({username, password: hashedPassword });
        const savedUser = await newUser.save();
        newUsernameNumber++;
        newUsers.push({username, password});
      }
      var creator = await User.findById(req.user.id);
      // send an email to inform the creator
      const email = process.env.EMAIL;
      const password = process.env.EMAIL_PASSWORD;
      const host = process.env.EMAIL_HOST;

      let transporter = nodemailer.createTransport({
        host: host,
        port: 465,
        secure: true, // if false TLS
        auth: {
            user: email, // email of the sender
            pass: password // Passwort of the sender
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
      });
      var table = `<p><table border=1 frame=void rules=rows>
                      <tr>
                        <th>Nutzername</th>
                        <th>Passwort</th>
                      </tr>`;
      newUsers.forEach((user, i) => {
        table = table + `<tr>
                          <td>${user.username}</td>
                          <td>${user.password}</td>
                         </tr>`;
      });
      table = table + '</table></p><p>Viele Grüße<br>Dein MyBadges-Team</p>';
      var mailOptions = {
          from: '"MyBadges"'+email, // sender address
          to: creator.email, // list of receiver
          subject: 'erstellte Accounts', // Subject line
          html: '<b>Hallo '+creator.firstname+' '+creator.lastname+'</b><br><p>Das sind die Zugangsdaten Deiner erstellen Accounts:</p>'+table // html body
      };
      // send mail with defined transport object
      transporter.sendMail(mailOptions);
      return res.status(201).send({
        message: 'Users are successfully registered.'
      });
    }
    else {
      return res.status(400).send({
        message: 'Count has to be a positive number.'
      });
    }
  }
  catch(err) {
    return res.status(500).send(err);
  }
};

module.exports = {
  postUsersRegister
};
