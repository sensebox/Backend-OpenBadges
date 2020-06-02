// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const User = require('../../../../models/user');
const Badge = require('../../../../models/badge');
const Course = require('../../../../models/course');


/**
 * @api {put} /api/v1/badge/:badgeId/course/:courseId/unassigne/user/:userId Unassigne a Badge
 * @apiName unassigneLocalBadge
 * @apiDescription Unassigne a Badge to a specified user.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} courseId the ID of the Course you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is unassigned successfully to user.` or </br> `Global Badge is unassigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already unassigned to user."}` or </br> `{"message": "Global Badge is already unassigned to user."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission unassigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "Course not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
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
                });
              }
              else{
                return res.status(400).send({
                  message: 'Local Badge is already unassigned to user.',
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
                });
              }
              else{
                return res.status(400).send({
                  message: 'Global Badge is already unassigned to user.',
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
            message: 'No permission unassigning the Badge to an user.',
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
 * @api {put} /api/v1/badge/:badgeId/course/:courseId/assigne/user/:userId Assigne a Badge
 * @apiName assigneLocalBadge
 * @apiDescription Assigne a Badge to a specified user.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} courseId the ID of the Course you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Local Badge is assigned successfully to user.` or `GLobal Badge is assigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Local Badge is already assigned to user."}` or `{"message": "Global Badge is already assigned to user."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission assigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "Course not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
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
                });
              }
              else {
                return res.status(400).send({
                  message: 'Local Badge is already assigned to user.',
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
                });
              }
              else {
                return res.status(400).send({
                  message: 'Global Badge is already assigned to user.',
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
 * @api {put} /api/v1/badge/course/:courseId/assigne Assigne multiple Badges
 * @apiName assigneMultipleLocalBadges
 * @apiDescription Assigne mutliple badges of a course to users from the course.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} courseId the ID of the Course you are referring to
 * @apiParam {Object} badges JSON-Object with userIds as Object-Key and the badgeIds in an array as value. </br> (e.g. `{<userId>: [<badgeId>, <badgeId>]}`)
 *
 * @apiSuccess (Success 200) {String} message `Badges are assigned successfully to users.`
 * @apiSuccess (Success 200) {Object} info `{"alreadyAssigned": <Number>, "userNotFound": <Number>, "badgeNotFound": <Number>}`
 *
 * @apiError (On error) {Object} 403 `{"message": "No permission assigning the Badges to the users."}`
 * @apiError (On error) {Object} 404 `{"message": "Course not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const assigneMultipleBadges = async function(req, res){
  var courseId = req.params.courseId;
  var badges = req.body.badges;
  try{
    var course = await Course.findById(courseId);
    if(course){
      // only the course creator has the permission to assigne a Badge
      if(course.creator == req.user.id){
        var info = {alreadyAssigned: 0, userNotFound: 0, badgeNotFound: 0};
        const promises = Object.keys(badges).map(async function(key){
          var user = await User.findById(key);
          if(user){
            const promises1 = badges[key].map(async function(badgeId) {
              var badge = await Badge.findById(badgeId);
              if(badge){
                if(course.localbadge.indexOf(badgeId) > -1){
                  // badge is a local badge
                  if(user.localbadge.indexOf(badgeId) < 0){
                    // badge is not assigned to user
                    return user.localbadge.push(badgeId);
                  }
                  else {
                    info.alreadyAssigned += 1;
                  }
                }
                else {
                  // badge is a global badge
                  if(user.badge.indexOf(badgeId) < 0){
                    // badge is not assigned to user
                    return user.badge.push(badgeId);
                  }
                  else {
                    info.alreadyAssigned += 1;
                  }
                }
              }
              else {
                info.badgeNotFound += 1;
              }
            });
            await Promise.all(promises1);
            return user.save();
          }
          else {
            info.userNotFound += 1;
          }
        });
        await Promise.all(promises);
        return res.status(200).send({
          message: 'Badges are assigned successfully to users.',
          info: info
        });
      }
      else {
        return res.status(403).send({
          message: 'No permission assigning the Badges to the users.',
        });
      }
    }
    else {
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
 * @api {put} /api/v1/badge/badgeId/grant/userId Grant permission to (un)assign a badge
 * @apiName grantPermissionAssignBadge
 * @apiDescription Grant a user permission to (un)assign a badge. (Only "original issuer" has the permission.)
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `User has successfully received permission to assign the badge.`
 *
 * @apiError (On error) {Object} 400 `{"message": "User has already permission to assigned the badge."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission to grant permissions regarding the badge."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const grantPermissionAssignBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      // only the original issuer has the permission to grant permission regarding the Badge
      if(badge.issuer[0] == req.user.id){
        var user = await User.findById(userId);
        if(user){
          if(badge.issuer.indexOf(userId) < 0){
            // user has no permission to assign the badge
            badge.issuer.push(userId);
            if(badge.request.indexOf(userId) > -1){
              // user requested permission to assign the badge
              badge.request.splice(badge.request.indexOf(userId), 1);
            }
            const updatedBadge = await badge.save();
            return res.status(200).send({
              message: 'User has successfully received permission to assign the badge.',
            });
          }
          else {
            return res.status(400).send({
              message: 'User has already permission to assigned the badge.',
            });
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
          message: 'No permission to grant permissions regarding the badge.',
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
 * @api {put} /api/v1/badge/badgeId/revoke/userId Revoke permission to (un)assign a badge
 * @apiName revokePermissionAssignBadge
 * @apiDescription Revoke a user permission to (un)assign a badge. (Only "original issuer" has the permission.)
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `User has successfully received no permission to assign the badge.`
 *
 * @apiError (On error) {Object} 400 `{"message": "User has already no permission to assigned the badge."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission to revoke permissions regarding the badge."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const revokePermissionAssignBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      // only the original issuer has the permission to grant permission regarding the Badge
      if(badge.issuer[0] == req.user.id){
        var user = await User.findById(userId);
        if(user){
          if(badge.issuer.indexOf(userId) > -1){
            // user has permission to assign the badge
            badge.issuer.splice(badge.issuer.indexOf(userId), 1);
            const updatedBadge = await badge.save();
            return res.status(200).send({
              message: 'User has successfully received no permission to assign the badge.',
            });
          }
          else {
            if(badge.request.indexOf(userId) > -1){
              // user requested permission to assign the badge
              badge.request.splice(badge.request.indexOf(userId), 1);
            }
            const updatedBadge = await badge.save();
            return res.status(400).send({
              message: 'User has already no permission to assigned the badge.',
            });
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
          message: 'No permission to revoke permissions regarding the badge.',
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
 * @api {put} /api/v1/badge/badgeId/request Request permission to (un)assign a badge
 * @apiName requestPermissionAssignBadge
 * @apiDescription Request permission to (un)assign a badge.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 *
 * @apiSuccess (Success 200) {String} message `User has successfully submitted his request.`
 *
 * @apiError (On error) {Object} 400 `{"message": "User has already submitted his request."}` or </br> `{"message": "User has already permission to assigned the badge."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const requestPermissionAssignBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      if(badge.issuer.indexOf(req.user.id) < 0){
        if(badge.request.indexOf(req.user.id) < 0){
          // user has no permission to assign the badge
          badge.request.push(req.user.id);
          const updatedBadge = await badge.save();
          return res.status(200).send({
            message: 'User has successfully submitted his request.',
          });
        }
        else {
          return res.status(400).send({
            message: 'User has already submitted his request.',
          });
        }
      }
      else {
        return res.status(400).send({
          message: 'User has already permission to assigned the badge.',
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
  unassigneBadge,
  assigneMultipleBadges,
  grantPermissionAssignBadge,
  revokePermissionAssignBadge,
  requestPermissionAssignBadge
};
