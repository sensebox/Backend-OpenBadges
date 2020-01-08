// jshint esversion: 8
// jshint node: true
"use strict";

const User = require('../../../../models/user');
const Badge = require('../../../../models/badge');

/**
 * @api {put} /badge/assigne/:badgeId/:userId/ (un)assigne a Badge
 * @apiName (un)assigneBadge
 * @apiDescription assigne (or unassigne) a Badge to a user
 * @apiGroup Badge
 *
 * @apiParam (Query for filtering Badges) {Boolean} assigne true: assign a Badge to user; false: unassign a Badge to user.
 *
 * @apiSuccess (Success 200) {String} message `Global Badge is assigned successfully to user.` or `Global Badge is unassigned successfully to user.` or `Local Badge is assigned successfully to user.` or `Local Badge is unassigned successfully to user.`
 * @apiSuccess (Success 200) {Object} user `{...}`
 *
 * @apiError (On error) {String} 404 `{"message": "User not found."}`
 * @apiError (On error) {String} 404 `{"message": "Badge not found."}`
 * @apiError (On error) {String} 400 `{"message": "Global Badge is already assigned to user."}`
 * @apiError (On error) {String} 400 `{"message": "Global Badge is already unassigned to user."}`
 * @apiError (On error) {String} 400 `{"message": "Local Badge is already assigned to user."}`
 * @apiError (On error) {String} 400 `{"message": "Local Badge is already unassigned to user."}`
 * @apiError (On error) 500 Complications during querying the database
 */
const assigneBadge = async function(req, res){
  var badgeId = req.params.badgeId;
  var userId = req.params.userId;
  var assigne = req.query.assigne;

  try{
    var badge = await Badge.findById(badgeId);
    var user = await User.findById(userId);
    if(badge){
      if(user){
        if(badge.global){
          if(assigne){
            if(user.badge.indexOf(badgeId) < 0){
              // badge is not assigned to user
              user.badge.push(badgeId);
              user.save();
              return res.status(200).send({
                message: 'Global Badge is assigned successfully to user.',
                user: user
              });
            }
            else{
              return res.status(400).send({
                message: 'Global Badge is already assigned to user.',
                user: user
              });
            }
          }
          else{
            if(user.badge.indexOf(badgeId) < 0){
              // badge is already unassigned to user
              return res.status(400).send({
                message: 'Global Badge is already unassigned to user.',
                user: user
              });
            }
            else {
              // badge is not unassigned to user
              user.splice(user.badge.indexOf(badgeId), 1);
              user.save();
              return res.status(200).send({
                message: 'Global Badge is unassigned successfully to user.',
                user: user
              });
            }
          }
        }
        // local badge
        else {
          if(assigne){
            if(user.localbadge.indexOf(badgeId) < 0){
              // badge is not assigned to user
              user.localbadge.push(badgeId);
              user.save();
              return res.status(200).send({
                message: 'Local Badge is assigned successfully to user.',
                user: user
              });
            }
            else{
              return res.status(400).send({
                message: 'Local Badge is already assigned to user.',
                user: user
              });
            }
          }
          else{
            if(user.localbadge.indexOf(badgeId) < 0){
              // badge is already unassigned to user
              return res.status(400).send({
                message: 'Local Badge is already unassigned to user.',
                user: user
              });
            }
            else {
              // badge is not unassigned to user
              user.splice(user.localbadge.indexOf(badgeId), 1);
              user.save();
              return res.status(200).send({
                message: 'Local Badge is unassigned successfully to user.',
                user: user
              });
            }
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
  assigneBadge
};
