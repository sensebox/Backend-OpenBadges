// jshint esversion: 8
// jshint node: true
"use strict";

const Course = require('../../../../models/course');


/**
 * @api {put} /api/v1/course/:courseId/user/registration Put the course (sign in a user)
 * @apiName courseSignIn
 * @apiDescription Register a user in a course, if the size is not reached.
 * @apiGroup Course
 *
 * @apiSuccess (Success 200) {String} message `User registered successfully in course.`
 *
 * @apiError (On error) {String} 404 `{"message": "Course not found."}`
 * @apiError (On error) {String} 400 `{"message": "Course size is already reached."}`
 * @apiError (On error) {String} 400 `{"message": "User is already registered in course."}`
 * @apiError (On error) 500 Complications during querying the database
 */
 const putCourseSignIn = async function(req, res){
   var courseId = req.params.courseId;
   try{
     var course = await Course.findById(courseId);
     if(course){
       if(course.participants.indexOf(req.user.id) < 0){
         // user is not signed in in course
         if(course.participants.length < course.size){
           course.participants.push(req.user.id);
           course.save();
           return res.status(200).send({
             message: 'User registered in successfully in course.',
           });
         }
         else{
           return res.status(400).send({
             message: 'Course size is already reached.',
           });
         }
       }
       else{
         return res.status(400).send({
           message: 'User is already registered in course.',
         });
       }
     }
     else{
       return res.status(404).send({
         message: 'Course not found.',
       });
     }
   }
   catch(err){
     return res.status(500).send(err);
   }
 };


 /**
  * @api {put} /api/v1/course/:courseId/user/deregistration Put the course (sign out a user)
  * @apiName courseSignOut
  * @apiDescription Deregister a user in a course, if the user was registered.
  * @apiGroup Course
  *
  * @apiSuccess (Success 200) {String} message `User deregistered successfully from course.`
  *
  * @apiError (On error) {String} 404 `{"message": "Course not found."}`
  * @apiError (On error) {String} 400 `{"message": "User is not registered in course."}`
  * @apiError (On error) 500 Complications during querying the database
  */
  const putCourseSignOut = async function(req, res){
    var courseId = req.params.courseId;
    try{
      var course = await Course.findById(courseId);
      if(course){
        if(course.participants.indexOf(req.user.id) > -1){
          // user is signed in in course
          course.participants.pop(req.user.id);
          course.save();
          return res.status(200).send({
            message: 'User deregistered successfully from course.',
          });
        }
        else{
          return res.status(400).send({
            message: 'User is not registered in course.',
          });
        }
      }
      else{
        return res.status(404).send({
          message: 'Course not found.',
        });
      }
    }
    catch(err){
      return res.status(500).send(err);
    }
  };




module.exports = {
  putCourseSignIn,
  putCourseSignOut
};
