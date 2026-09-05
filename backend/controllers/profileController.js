const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { cloudinary } = require("../config/cloudinary"); // Import cloudinary

// get user profile
exports.getUserProfile = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

// Update user's profile picture ONLY
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No profile picture uploaded" });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Delete old profile picture from Cloudinary if exists
    if (user.profilePicture) {
      try {
        // Extract public_id from Cloudinary URL
        const publicId = user.profilePicture.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`lets-chat/${publicId}`);
      } catch (err) {
        console.log('Error deleting old image:', err);
        // Continue even if deletion fails
      }
    }

    // ✅ Store Cloudinary URL from multer
    const updateData = { profilePicture: req.file.path };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");
    
    res.json({ 
      message: "Profile picture updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    console.error("Update profile picture error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user's profile (excluding profile picture)
exports.updateUserProfile = async (req, res) => {
  try {
    const {
      firstname,  // ✅ Match your schema field names
      lastname,
      username,
      currentLocation,
      hometown,
      profession,
      hobbies,
      favoritePlaces,
      bio,
    } = req.body;

    const updateData = {
      firstname,
      lastname,
      username,
      currentLocation,
      hometown,
      profession,
      hobbies: hobbies ? hobbies.split(',').map(h => h.trim()) : [], // Convert comma-separated string to array
      favoritePlaces: favoritePlaces ? favoritePlaces.split(',').map(p => p.trim()) : [],
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

    user.password = newPassword; // ✅ Pre-save hook will hash it
    await user.save();
    
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // ✅ Use $pull with proper MongoDB syntax
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    res.json({ message: "User unfriended successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

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

    const senderId = request.userId;
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

    // ✅ Delete old background wall from Cloudinary if exists
    if (user.backgroundWall) {
      try {
        const publicId = user.backgroundWall.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`lets-chat/${publicId}`);
      } catch (err) {
        console.log('Error deleting old background:', err);
        // Continue even if deletion fails
      }
    }

    // ✅ Store Cloudinary URL
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

    // ✅ Delete background wall from Cloudinary
    if (user.backgroundWall) {
      try {
        const publicId = user.backgroundWall.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`lets-chat/${publicId}`);
      } catch (err) {
        console.log('Error deleting background:', err);
        // Continue even if deletion fails
      }
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