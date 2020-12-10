// jshint esversion: 8
// jshint node: true
"use strict";

const Project = require('../../../../models/project');
const User = require('../../../../models/user');
const MultipleUser = require('../../../../models/multipleUser');
const Code = require('../../../../models/code');


/**
 * @api {put} /api/v1/project/:projectId/user/registration Register me
 * @apiName projectSignIn
 * @apiDescription Register currently logged in user in a project, if the size is not reached.
 * @apiGroup Project
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 *
 * @apiSuccess (Success 200) {String} message `User registered successfully in project.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Project size is already reached."}` or </br> `{"message": "User is already registered in project."}`
 * @apiError (On error) {Object} 404 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
 const putProjectSignIn = async function(req, res){
   var projectId = req.params.projectId;
   try{
     var project = await Project.findById(projectId);
     if(project){
       if(project.participants.indexOf(req.user.id) < 0){
         // user is not signed in in project
         if(project.participants.length < project.size){
           project.participants.push(req.user.id);
           project.save();
           return res.status(200).send({
             message: 'User registered successfully in project.',
           });
         }
         else{
           return res.status(400).send({
             message: 'Project size is already reached.',
           });
         }
       }
       else{
         return res.status(400).send({
           message: 'User is already registered in project.',
         });
       }
     }
     else{
       return res.status(404).send({
         message: 'Project not found.',
       });
     }
   }
   catch(err){
     return res.status(500).send(err);
   }
 };


 /**
  * @api {put} /api/v1/project/:projectId/user/deregistration Deregister me
  * @apiName projectSignOut
  * @apiDescription Deregister a user in a project, if the user was registered.
  * @apiGroup Project
  *
  * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
  * @apiHeaderExample {String} Authorization Header Example
  *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
  *
  * @apiParam {ObjectId} projectId the ID of the project you are referring to
  *
  * @apiSuccess (Success 200) {String} message `User deregistered successfully from project.`
  *
  * @apiError (On error) {Object} 400 `{"message": "User is not registered in project."}`
  * @apiError (On error) {Object} 404 `{"message": "Project not found."}`
  * @apiError (On error) {Object} 500 Complications during querying the database
  */
  const putProjectSignOut = async function(req, res){
    var projectId = req.params.projectId;
    try{
      var project = await Project.findById(projectId);
      if(project){
        if(project.participants.indexOf(req.user.id) > -1){
          // user is signed in in project
          project.participants.pop(req.user.id);
          project.save();
          return res.status(200).send({
            message: 'User deregistered successfully from project.',
          });
        }
        else{
          return res.status(400).send({
            message: 'User is not registered in project.',
          });
        }
      }
      else{
        return res.status(404).send({
          message: 'Project not found.',
        });
      }
    }
    catch(err){
      return res.status(500).send(err);
    }
  };


  /**
   * @api {put} /api/v1/project/code/:code Register me by code
   * @apiName projectSignInCode
   * @apiDescription Register currently logged in user in a project, if the size is not reached, by a code. Furthermore all belonging project badges are automatically assigned to the user.
   * @apiGroup Project
   *
   * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
   * @apiHeaderExample {String} Authorization Header Example
   *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
   *
   * @apiParam {Code} code the code (6 letters) to sign in project and get all badges automatically
   *
   * @apiSuccess (Success 200) {String} message `User registered in project and all Badges are assigned successfully to user.`
   *
   * @apiError (On error) {Object} 400 `{"message": "Project size is already reached."}` or </br> `{"message": "User is already registered in project."}`
   * @apiError (On error) {Object} 404 `{"message": "Code is invalid."}`
   * @apiError (On error) {Object} 500 Complications during querying the database.
   */
   const putProjectSignInCode = async function(req, res){
     var code = req.params.code;
     try{
       code = await Code.findOne({code: code});
       if(code){
         var project = await Project.findById(code.project);
         if(project.participants.indexOf(req.user.id) < 0){
           // user is not signed in in project
           if(project.participants.length < project.size){
             project.participants.push(req.user.id);
             var test = await project.save();
             var user = await User.findById(req.user.id);
             if(!user){
               user = await MultipleUser.findById(req.user.id);
             }
             code.badge.map(badgeId => {
               if(user.badge.indexOf(badgeId) < 0){
                 user.badge.push(badgeId);
               }
             });
             var test2 = await user.save();
             return res.status(200).send({
               message: 'User registered in project and all Badges are assigned successfully to user.',
             });
           }
           else{
             return res.status(400).send({
               message: 'Project size is already reached.',
             });
           }
         }
         else{
           return res.status(400).send({
             message: 'User is already registered in project.',
           });
         }
       }
       else{
         return res.status(404).send({
           message: 'Code is invalid.',
         });
       }
     }
     catch(err){
       return res.status(500).send(err);
     }
   };




module.exports = {
  putProjectSignIn,
  putProjectSignOut,
  putProjectSignInCode
};
