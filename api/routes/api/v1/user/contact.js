// jshint esversion: 8
// jshint node: true
"use strict";

const nodemailer = require('nodemailer');
const moment = require('moment');


/**
 * @api {post} /user/contact Contact support
 * @apiName Contact
 * @apiDescription Send an email to the support of the deposited API-Email.
 * @apiGroup User
 *
 * @apiParam {String} email the email of the user
 * @apiParam {String} subject the subject of the email
 * @apiParam {String} content the content of the email (plaintext)
 *
 * @apiSuccess (Success 200) {String} message `Emails are successfully sent.`
 *
 * @apiError (On error) 500 Complications during sending the email.
 */
const contact = function(req, res){
  try {
    var userEmail = req.body.email;
    var subject = req.body.subject;
    var content = req.body.content;

    // send an email to confirm the email
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD_Email;

    let transporter = nodemailer.createTransport({
      host: 'mail.gmx.net',
      port: 587,
      secure: false, // if false TLS
      auth: {
          user: email, // email of the sender
          pass: password // Passwort of the sender
      },
      tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
      }
    });
    var mailOptions = {
        from: email, // sender address
        to: email,// list of receiver
        subject: subject, // Subject line
        text: 'Mail from '+userEmail+'\n\n'+content
    };

    var mailOptions2 = {
        from: email, // sender address
        to: userEmail,// list of receiver
        subject: 'copy of your email request', // Subject line
        text: 'Thanks for your email from '+moment.utc().toDate()+'\n\n'+content
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
      if(error){
        return res.status(500).send(error);
      }
      else {
        transporter.sendMail(mailOptions2, function(error2, info2){
          if(error2){
            return res.status(500).send(error2);
          }
          else {
            return res.status(200).send({
              message: 'Emails are successfully sent.'
            });
          }
        });
      }
    });

  }
  catch(err){
    return res.status(500).send(err);
  }
};

module.exports = {
  contact
};
