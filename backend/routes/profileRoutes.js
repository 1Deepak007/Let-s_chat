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
const authenticate = require("../middleware/authMiddleware");
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Profile routes
router.get('/:userId', authenticate, getUserProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/update-profile', authenticate, updateUserProfile);

// File upload routes - using Cloudinary upload
router.put('/update-profile-picture', authenticate, upload.single('profilePicture'), updateProfilePicture);
router.put('/update-background-wall', authenticate, upload.single('backgroundWall'), updateBackgroundWall);

// Friend management
router.delete('/unfriend/:friendId', authenticate, unfriend);
router.put('/reject-request/:requestId', authenticate, rejectFriendRequest);
router.delete('/delete-background-wall', authenticate, deleteBackgroundWall);

module.exports = router;