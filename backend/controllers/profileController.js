const User = require("../models/User");
const bcrypt = require("bcryptjs");
const upload = require("../middleware/upload");
const fs = require("fs");


// get user profile
exports.getUserProfile = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Assuming your Mongoose model name is User (replace if different)
    const user = await User.findById(userId); // Project to exclude password field
    if (!user) return res.status(404).json({ message: `User not found` });

    res.json(user);
  } catch (err) {
    // console.error('Error in getUserProfile:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

// Update user's profile picture ONLY
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" }); // Important check
    }

    const updateData = { profilePicture: req.file.path };

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile picture updated successfully", user });
  } catch (err) {
    console.error("Update profile picture error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user's profile (excluding profile picture)
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      currentLocation,
      hometown,
      profession,
      hobbies,
      favoritePlaces,
      bio,
    } = req.body; // Get all the new fields from the request body
    const updateData = {
      firstname: firstName,
      lastname: lastName,
      username,
      currentLocation,
      hometown,
      profession,
      hobbies,
      favoritePlaces,
      bio,
    };

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    // console.log('Old Password Hash:', user.password);
    // console.log('New Password Before Hashing:', newPassword);

    user.password = newPassword;
    // user.password = await bcrypt.hash(newPassword, 10);
    // console.log('New Password After Hashing:', user.password);

    await user.save();
    // console.log('New Password After Hashing:', user.password);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

exports.unfriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // Use MongoDB's $pull operator to efficiently remove the friend
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: { userId: friendId } },
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: { userId: userId } },
    });

    res.json({ message: "User unfriended successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id; // User rejecting the request

    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const request = receiver.friendRequests.find(
      (req) => req._id.toString() === requestId
    );
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const senderId = request.userId; // ID of the user who sent the request
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // 1. Remove request from receiver's friendRequests
    receiver.friendRequests = receiver.friendRequests.filter(
      (req) => req._id.toString() !== requestId
    );
    await receiver.save();

    // 2. Send notification to the sender
    sender.notifications.push({
      message: `${receiver.username} rejected your friend request.`,
      notificationType: "system",
    });
    await sender.save();

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateBackgroundWall = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No background image uploaded" });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old background file if it exists locally
    if (user.backgroundWall && fs.existsSync(user.backgroundWall)) {
      fs.unlinkSync(user.backgroundWall);
    }

    // Update document with new path
    user.backgroundWall = req.file.path;
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Background wall updated successfully",
      backgroundWall: user.backgroundWall,
      user: updatedUser
    });
  } catch (err) {
    console.error("Update background wall error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete Background Wall
exports.deleteBackgroundWall = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete file from server storage if present
    if (user.backgroundWall && fs.existsSync(user.backgroundWall)) {
      fs.unlinkSync(user.backgroundWall);
    }

    // Reset backgroundWall field in DB
    user.backgroundWall = "";
    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Background wall removed successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Delete background wall error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
