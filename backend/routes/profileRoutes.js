const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  unfriend,
  rejectFriendRequest,
  updateProfilePicture,
  updateBackgroundWall,
  deleteBackgroundWall
} = require('../controllers/profileController');
const authenticate = require("../middleware/authMiddleware"); // Import auth middleware

module.exports = (upload) => {
  const router = express.Router();

  router.get('/:userId', authenticate, getUserProfile);
  router.put('/change-password', authenticate, changePassword);
  
  router.put('/update-profile', authenticate, updateUserProfile); // For other details
  router.put('/update-profile-picture', authenticate, upload.single('profilePicture'), updateProfilePicture); // For profile picture only

  router.delete('/unfriend/:friendId', authenticate, unfriend);
  router.put('/reject-request/:requestId', authenticate, rejectFriendRequest);

  router.put('/update-background-wall', authenticate, upload.single('backgroundWall'), updateBackgroundWall);
  router.delete('/delete-background-wall', authenticate, deleteBackgroundWall);

  return router;
};
