// jshint esversion: 8
// jshint node: true
"use strict";

const User = require('../../../../models/user');
const Badge = require('../../../../models/badge');
const Course = require('../../../../models/course');


/**
 * @api {put} /api/v1/badge/:badgeId/unassigne/user/:userId unassigne a Badge
 * @apiName unassigneLocalBadge
 * @apiDescription unassigne a Badge to current sign in user
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is unassigned successfully to user.` or `Global Badge is unassigned successfully to user.`
 * @apiSuccess (Success 200) {Object} user `{...}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already unassigned to user."}` or `{"message": "Global Badge is already unassigned to user."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission unassigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
  * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during querying the database."}`
 */
const unassigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var courseId = req.params.courseId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      var course = await Course.findById(courseId);
      if(course){
        // only the course creator has the permission to assigne a Badge
        if(course.creator == req.user.id && (course.badge.indexOf(badgeId) > -1 || course.localbadge.indexOf(badgeId) > -1)){
          var user = await User.findById(userId);
          if(user){
            if(course.localbadge.indexOf(badgeId) > -1){
              // badge is a local badge
              if(user.localbadge.indexOf(badgeId) > -1){
                // badge is not unassigned to user
                user.localbadge.splice(user.localbadge.indexOf(badgeId), 1);
                const updatedUser = await user.save();
                return res.status(200).send({
                  message: 'Local Badge is unassigned successfully to user.',
                  user: updatedUser
                });
              }
              else{
                return res.status(400).send({
                  message: 'Local Badge is already unassigned to user.',
                  user: user
                });
              }
            }
            else {
              // badge is a global badge
              if(user.badge.indexOf(badgeId) > -1){
                // badge is not unassigned to user
                user.badge.splice(user.badge.indexOf(badgeId), 1);
                const updatedUser = await user.save();
                return res.status(200).send({
                  message: 'Global Badge is unassigned successfully to user.',
                  user: updatedUser
                });
              }
              else{
                return res.status(400).send({
                  message: 'Global Badge is already unassigned to user.',
                  user: user
                });
              }
            }
          }
          else {
            return res.status(404).send({
              message: 'User not found.',
            });
          }
        }
        else {
          return res.status(403).send({
            message: 'No permission assigning the Badge to an user.',
          });
        }
      }
      else {
        return res.status(404).send({
          message: 'Course not found.',
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Badge not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};



/**
 * @api {put} /api/v1/badge/:badgeId/course/:courseId/assigne/user/:userId assigne a Badge
 * @apiName assigneLocalBadge
 * @apiDescription assigne a Badge to current sign in user
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is assigned successfully to user.` or `GLobal Badge is assigned successfully to user.`
 * @apiSuccess (Success 200) {Object} user `{...}`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already assigned to user."}` or `{"message": "Global Badge is already assigned to user."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission assigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 404 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 404 `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 `{"message": "Complications during querying the database."}`
 */
const assigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var courseId = req.params.courseId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      var course = await Course.findById(courseId);
      if(course){
        // only the course creator has the permission to assigne a Badge
        if(course.creator == req.user.id && (course.badge.indexOf(badgeId) > -1 || course.localbadge.indexOf(badgeId) > -1)){
          var user = await User.findById(userId);
          if(user){
            if(course.localbadge.indexOf(badgeId) > -1){
              // badge is a local badge
              if(user.localbadge.indexOf(badgeId) < 0){
                // badge is not assigned to user
                user.localbadge.push(badgeId);
                const updatedUser = await user.save();
                return res.status(200).send({
                  message: 'Local Badge is assigned successfully to user.',
                  user: updatedUser
                });
              }
              else {
                return res.status(400).send({
                  message: 'Local Badge is already assigned to user.',
                  user: user
                });
              }
            }
            else {
              // badge is a global badge
              if(user.badge.indexOf(badgeId) < 0){
                // badge is not assigned to user
                user.badge.push(badgeId);
                const updatedUser = await user.save();
                return res.status(200).send({
                  message: 'Global Badge is assigned successfully to user.',
                  user: updatedUser
                });
              }
              else {
                return res.status(400).send({
                  message: 'Global Badge is already assigned to user.',
                  user: user
                });
              }
            }
          }
          else {
            return res.status(404).send({
              message: 'User not found.',
            });
          }
        }
        else {
          return res.status(403).send({
            message: 'No permission assigning the Badge to an user.',
          });
        }
      }
      else {
        return res.status(404).send({
          message: 'Course not found.',
        });
      }
    }
    else {
      return res.status(404).send({
        message: 'Badge not found.',
      });
    }
  }
  catch(err){
    return res.status(500).send(err);
  }
};


module.exports = {
  assigneBadge,
  unassigneBadge
};
