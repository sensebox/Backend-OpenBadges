// jshint esversion: 8
// jshint node: true
"use strict";

const mongoose = require('mongoose');

const User = require('../../../../models/user');
const Badge = require('../../../../models/badge');
const Project = require('../../../../models/project');


/**
 * @api {put} /api/v1/badge/:badgeId/project/:projectId/unassigne/user/:userId Unassigne a project-related Badge
 * @apiName unassigneProjectBadge
 * @apiDescription Unassigne a project-related Badge to a specified user of given project.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge is unassigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Badge is already unassigned to user."}` or </br> `{"message": "User is not related to given project."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission unassigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "Project not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const unassigneProjectBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var projectId = req.params.projectId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      var project = await Project.findById(projectId);
      if(project){
        // only the project creator has the permission to assigne a Badge
        if(project.creator == req.user.id && project.badge.indexOf(badgeId) > -1){
          var user = await User.findById(userId);
          if(user){
            if(project.participants.indexOf(userId) > -1){
              if(user.badge.indexOf(badgeId) > -1){
                // badge is not unassigned to user
                user.badge.splice(user.badge.indexOf(badgeId), 1);
                const updatedUser = await user.save();
                return res.status(200).send({
                  message: 'Badge is unassigned successfully to user.',
                });
              }
              else {
                return res.status(400).send({
                  message: 'Badge is already unassigned to user.',
                });
              }
            }
            else {
              return res.status(400).send({
                message: 'User is not related to given project.',
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
            message: 'No permission unassigning the Badge to an user.',
          });
        }
      }
      else {
        return res.status(404).send({
          message: 'Project not found.',
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
 * @api {put} /api/v1/badge/:badgeId/project/:projectId/assigne/user/:userId Assigne a project-related Badge
 * @apiName assigneProjectBadge
 * @apiDescription Assigne a project-related Badge to a specified user of given project.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} projectId the ID of the Project you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge is assigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Badge is already assigned to user."}` or </br> `{"message": "User is not related to given project."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission assigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "Project not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const assigneProjectBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var projectId = req.params.projectId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      var project = await Project.findById(projectId);
      if(project){
        // only the project creator has the permission to assigne a Badge
        if(project.creator == req.user.id && project.badge.indexOf(badgeId) > -1){
          var user = await User.findById(userId);
          if(user){
            if(project.participants.indexOf(userId) > -1){
              // user is related to given project
              if(user.badge.indexOf(badgeId) < 0){
                // badge is not assigned to user
                user.badge.push(badgeId);
                const updatedUser = await user.save();
                return res.status(200).send({
                  message: 'Badge is assigned successfully to user.',
                });
              }
              else {
                return res.status(400).send({
                  message: 'Badge is already assigned to user.',
                });
              }
            }
            else {
              return res.status(400).send({
                message: 'User is not related to given project.',
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
            message: 'No permission assigning the Badge to an user.',
          });
        }
      }
      else {
        return res.status(404).send({
          message: 'Project not found.',
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
 * @api {put} /api/v1/badge/project/:projectId/assigne Assigne multiple project-related Badges
 * @apiName assigneMultipleProjectBadges
 * @apiDescription Assigne mutliple badges of a project to users of the given project.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} projectId the ID of the project you are referring to
 * @apiParam {Object} badges JSON-Object with userIds as Object-Key and the badgeIds in an array as value. </br> (e.g. `{<userId>: [<badgeId>, <badgeId>]}`)
 *
 * @apiSuccess (Success 200) {String} message `Badges are assigned successfully to users.`
 * @apiSuccess (Success 200) {Object} info `{"alreadyAssigned": <Number>, "userNotFound": <Number>, "badgeNotFound": <Number>, "badgeNotRelatedToProject": <Number>, "userNotRelatedToProject": <Number>}`
 *
 * @apiError (On error) {Object} 403 `{"message": "No permission assigning the Badges to the users."}`
 * @apiError (On error) {Object} 404 `{"message": "Project not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const assigneMultipleBadges = async function(req, res){
  var projectId = req.params.projectId;
  var badges = req.body.badges;
  try{
    var project = await Project.findById(projectId);
    if(project){
      // only the project creator has the permission to assigne a Badge
      if(project.creator == req.user.id){
        var info = {alreadyAssigned: 0, userNotFound: 0, badgeNotFound: 0, badgeNotRelatedToProject: 0, userNotRelatedToProject: 0};
        const promises = Object.keys(badges).map(async function(key){
          var user = await User.findById(key);
          if(user){
            if(project.participants.indexOf(key) > -1){
              // user is related to given project
              const promises1 = badges[key].map(async function(badgeId) {
                if(project.badge.indexOf(badgeId) > -1){
                  var badge = await Badge.findById(badgeId);
                  if(badge){
                    if(user.badge.indexOf(badgeId) < 0){
                      // badge is not assigned to user
                      return user.badge.push(badgeId);
                    }
                    else {
                      info.alreadyAssigned += 1;
                    }
                  }
                  else {
                    info.badgeNotFound += 1;
                  }
                }
                else {
                  info.badgeNotRelatedToProject += 1;
                }
              });
              await Promise.all(promises1);
              return user.save();
            }
            else {
              info.userNotRelatedToProject += 1;
            }
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
        message: 'Project not found.',
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
 * @apiDescription Grant a user permission to (un)assign a badge. (Only "Badge-issuer" have the permission.)
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
 * @apiError (On error) {Object} 400 `{"message": "User has already permission to assign the badge."}`
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
      if(badge.issuer.indexOf(req.user.id) > -1){
        var user = await User.findById(userId);
        if(user){
          if(badge.mentor.indexOf(userId) < 0){
            // user has no permission to assign the badge
            badge.mentor.push(userId);
            if(badge.requestor.indexOf(userId) > -1){
              // user requested permission to assign the badge
              badge.requestor.splice(badge.requestor.indexOf(userId), 1);
            }
            const updatedBadge = await badge.save();
            return res.status(200).send({
              message: 'User has successfully received permission to assign the badge.',
            });
          }
          else {
            return res.status(400).send({
              message: 'User has already permission to assign the badge.',
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
 * @apiDescription Revoke a user permission to (un)assign a badge. (Only "Badge-issuer" have the permission.)
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
 * @apiError (On error) {Object} 400 `{"message": "User has already no permission to assign the badge."}`
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
      if(badge.issuer.indexOf(req.user.id) > -1){
        var user = await User.findById(userId);
        if(user){
          if(badge.mentor.indexOf(userId) > -1){
            // user has permission to assign the badge
            badge.mentor.splice(badge.mentor.indexOf(userId), 1);
            const updatedBadge = await badge.save();
            return res.status(200).send({
              message: 'User has successfully received no permission to assign the badge.',
            });
          }
          else {
            if(badge.requestor.indexOf(userId) > -1){
              // user requested permission to assign the badge
              badge.requestor.splice(badge.requestor.indexOf(userId), 1);
            }
            const updatedBadge = await badge.save();
            return res.status(400).send({
              message: 'User has already no permission to assign the badge.',
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
 * @apiError (On error) {Object} 400 `{"message": "User has already submitted his request."}` or </br> `{"message": "User has already permission to assign the badge."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const requestPermissionAssignBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      if(badge.issuer.indexOf(req.user.id) < 0 && badge.mentor.indexOf(req.user.id) < 0){
        if(badge.requestor.indexOf(req.user.id) < 0){
          // user has no permission to assign the badge
          badge.requestor.push(req.user.id);
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
          message: 'User has already permission to assign the badge.',
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
 * @api {put} /api/v1/badge/badgeId/issuer/userId Grant permission to manage a badge
 * @apiName issuerBadge
 * @apiDescription Grant a user permission to manage a badge. He becomes a issuer. (Only "Badge-issuer" have the permission.)
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `User has successfully received permission to manage the badge.`
 *
 * @apiError (On error) {Object} 400 `{"message": "User has already permission to manage the badge."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission to grant permissions regarding the badge."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const nominateIssuerBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      // only the original issuer has the permission to grant permission regarding the Badge
      if(badge.issuer.indexOf(req.user.id) > -1){
        var user = await User.findById(userId);
        if(user){
          if(badge.issuer.indexOf(userId) < 0){
            // user has no permission to manage the badge
            badge.issuer.push(userId);
            if(badge.mentor.indexOf(userId) > -1){
              // user has permission to assign the badge (not to manage)
              badge.mentor.splice(badge.mentor.indexOf(userId), 1);
            }
            else if(badge.requestor.indexOf(userId) > -1){
              // user requested permission to assign the badge
              badge.requestor.splice(badge.requestor.indexOf(userId), 1);
            }
            const updatedBadge = await badge.save();
            return res.status(200).send({
              message: 'User has successfully received permission to manage the badge.',
            });
          }
          else {
            return res.status(400).send({
              message: 'User has already permission to manage the badge.',
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
 * @api {put} /api/v1/admin/badge/:badgeId/unassigne/user/:userId Unassigne a Badge
 * @apiName unassigneBadge
 * @apiDescription Unassigne a Badge to an user.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge is unassigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Badge is already unassigned to user."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission unassigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const unassigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      // only the badge issuers and mentors have the permission to assigne the Badge
      if(badge.issuer.indexOf(req.user.id) > -1 || badge.mentor.indexOf(req.user.id) > -1){
        var user = await User.findById(userId);
        if(user){
          if(user.badge.indexOf(badgeId) > -1){
            // badge is not unassigned to user
            user.badge.splice(user.badge.indexOf(badgeId), 1);
            const updatedUser = await user.save();
            return res.status(200).send({
              message: 'Badge is unassigned successfully to user.',
            });
          }
          else{
            return res.status(400).send({
              message: 'Badge is already unassigned to user.',
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
          message: 'No permission unassigning the Badge to an user.',
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
 * @api {put} /api/v1/badge/:badgeId/assigne/user/:userId Assigne a Badge
 * @apiName assigneBadge
 * @apiDescription Assigne a Badge to an user.
 * @apiGroup Badge
 *
 * @apiHeader {String} Authorization allows to send a valid JSON Web Token along with this request with `Bearer` prefix.
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlMTk5OTEwY2QxMDgyMjA3Y2Y1ZGM2ZiIsImlhdCI6MTU3ODg0NDEwOSwiZXhwIjoxNTc4ODUwMTA5fQ.D4NKx6uT3J329j7JrPst6p02d311u7AsXVCUEyvoiTo
 *
 * @apiParam {ObjectId} badgeId the ID of the Badge you are referring to
 * @apiParam {ObjectId} userId the ID of the user you are referring to
 *
 * @apiSuccess (Success 200) {String} message `Badge is assigned successfully to user.`
 *
 * @apiError (On error) {Object} 400 `{"message": "Badge is already assigned to user."}`
 * @apiError (On error) {Object} 403 `{"message": "No permission assigning the Badge to an user."}`
 * @apiError (On error) {Object} 404 `{"message": "Badge not found."}` or </br> `{"message": "User not found."}`
 * @apiError (On error) {Object} 500 Complications during querying the database.
 */
const assigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;

  try{
    var badge = await Badge.findById(badgeId);
    if(badge){
      // only the badge issuers and mentors have the permission to assigne the Badge
      if(badge.issuer.indexOf(req.user.id) > -1 || badge.mentor.indexOf(req.user.id) > -1){
        var user = await User.findById(userId);
        if(user){
          if(user.badge.indexOf(badgeId) < 0){
            // badge is not assigned to user
            user.badge.push(badgeId);
            const updatedUser = await user.save();
            return res.status(200).send({
              message: 'Badge is assigned successfully to user.',
            });
          }
          else {
            return res.status(400).send({
              message: 'Badge is already assigned to user.',
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
          message: 'No permission unassigning the Badge to an user.',
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
  assigneProjectBadge,
  unassigneProjectBadge,
  assigneMultipleBadges,
  assigneBadge,
  unassigneBadge,
  grantPermissionAssignBadge,
  revokePermissionAssignBadge,
  requestPermissionAssignBadge,
  nominateIssuerBadge
};
