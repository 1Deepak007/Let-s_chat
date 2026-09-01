const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

module.exports = (io) => {
  // Fetch chat messages
  const getMessages = async (req, res) => {
    const { senderId, receiverId } = req.body;

    try {
      // Validate IDs (ensure both are valid MongoDB ObjectId)
      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }

      // Convert to ObjectId
      const senderObjId = new mongoose.Types.ObjectId(senderId);
      const receiverObjId = new mongoose.Types.ObjectId(receiverId);

      // Fetch sender and receiver users
      const [senderUser, receiverUser] = await Promise.all([
        User.findById(senderObjId),
        User.findById(receiverObjId),
      ]);

      // Check if sender and receiver exist
      if (!senderUser || !receiverUser) {
        return res
          .status(404)
          .json({ message: "Sender or receiver user not found" });
      }

      // Check if sender and receiver are friends
      const areFriends =
        senderUser.friends.some((friendId) => friendId.equals(receiverObjId)) &&
        receiverUser.friends.some((friendId) => friendId.equals(senderObjId));

      if (!areFriends) {
        return res
          .status(403)
          .json({ message: "You are not friends with this user" });
      }

      // Fetch messages between sender and receiver
      const messages = await Message.find({
        $or: [
          { sender: senderObjId, receiver: receiverObjId },
          { sender: receiverObjId, receiver: senderObjId },
        ],
        isDeleted: false,
      })
        .sort({ timestamp: 1 }) // Sort by timestamp (ascending order)
        .populate("sender", "username firstname lastname profilePicture _id")
        .populate("receiver", "username firstname lastname profilePicture _id")
        .lean();

      // Return all messages sorted by timestamp
      res.status(200).json(messages);
    } catch (err) {
      console.error("Error fetching conversation:", err);
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  // Send message and emit real-time event
  const sendMessage = async (req, res) => {
    const { sender, receiver, content, messageType } = req.body;

    // console.log('sender : ',sender);
    // console.log('receiver : ',receiver);
    // console.log('content : ',content);
    // console.log('messageType : ',messageType);

    try {
      const senderId = new mongoose.Types.ObjectId(sender);
      const receiverId = new mongoose.Types.ObjectId(receiver);

      // *** THIS IS THE CORRECT WAY TO GET THE USERS ***
      const [senderUser, receiverUser] = await Promise.all([
        User.findById(senderId),
        User.findById(receiverId),
      ]);

      if (!senderUser || !receiverUser) {
        return res
          .status(404)
          .json({ message: "Sender or receiver user not found" });
      }

      const areFriends =
        senderUser.friends.some((friendId) => friendId.equals(receiverId)) &&
        receiverUser.friends.some((friendId) => friendId.equals(senderId));

      if (!areFriends) {
        return res
          .status(403)
          .json({ message: "You are not friends with this user" });
      }

      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content || "",
        messageType: messageType || "text",
        fileUrl: req.body.fileUrl || "",
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username firstname lastname profilePicture _id")
        .populate("receiver", "username firstname lastname profilePicture _id");

      io.to(sender).emit("newMessage", populatedMessage);
      io.to(receiver).emit("newMessage", populatedMessage);

      res.status(201).json({ message: "Message sent", data: populatedMessage });
    } catch (err) {
      console.error("Error in sendMessage:", err);
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  const editMessage = async (req, res) => {
    const { messageId, newContent } = req.body;

    try {
        // 1. Convert messageId to ObjectId
        const objectIdMessageId = new mongoose.Types.ObjectId(messageId);

        const message = await Message.findById(objectIdMessageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        // 2. Correct authorization check (using toString() for comparison)
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to edit." });
        }

        // 3. Timestamp check: Only allow editing within the last 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const msgTime = message.timestamp || message.createdAt;
        if (msgTime < tenMinutesAgo) {
            return res.status(400).json({ message: "Messages can only be edited within 10 minutes of sending." });
        }

        message.content = newContent;
        message.isEdited = true;
        message.lastEditedAt = new Date();
        await message.save();

        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username firstname lastname profilePicture _id")
            .populate("receiver", "username firstname lastname profilePicture _id");

        // 4. Emit to correct rooms (using the same logic as sendMessage)
        io.to(message.sender.toString()).emit("messageEdited", populatedMessage);
        io.to(message.receiver.toString()).emit("messageEdited", populatedMessage);

        res.status(200).json({ message: "Message edited", data: populatedMessage });
    } catch (err) {
        console.error("Error in editMessage:", err);
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
          return res.status(400).json({ message: "Invalid message ID format." });
        }
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

  // soft deletion : i am not actually deleting the message but turning it to isDeleted = true, which will soft delete the message.
  const deleteMessage = async (req, res) => {
    const { messageId } = req.body;

    try {
      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (message.sender.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete." });
      }

      // Only allow deletion within the last 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const msgTime = message.timestamp || message.createdAt;
      if (msgTime < tenMinutesAgo) {
        return res.status(400).json({ message: "Messages can only be deleted within 10 minutes of sending." });
      }


      message.isDeleted = true;
      await message.save();

      const populatedMessage = await Message.findById(messageId)
        .populate("sender", "username firstname lastname profilePicture _id")
        .populate("receiver", "username firstname lastname profilePicture _id");

      io.to(message.sender.toString()).emit("messageDeleted", populatedMessage);
      io.to(message.receiver.toString()).emit("messageDeleted", populatedMessage);

      res
        .status(200)
        .json({ message: "Message deleted", data: populatedMessage });
    } catch (err) {
      console.error("Error in deleteMessage:", err);
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  // Delete entire conversation between current user and friend
  const deleteConversation = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user.id;

    try {
      if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return res.status(400).json({ message: "Invalid friend ID format" });
      }

      const userObjId = new mongoose.Types.ObjectId(userId);
      const friendObjId = new mongoose.Types.ObjectId(friendId);

      // Soft delete all messages between these two users
      await Message.updateMany(
        {
          $or: [
            { sender: userObjId, receiver: friendObjId },
            { sender: friendObjId, receiver: userObjId },
          ],
          isDeleted: false,
        },
        { $set: { isDeleted: true } }
      );

      // Real-time socket event (optional: updates both users if desired)
      io.to(userId).emit("conversationDeleted", { friendId });
      io.to(friendId).emit("conversationDeleted", { friendId: userId });

      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (err) {
      console.error("Error in deleteConversation:", err);
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  return { getMessages, sendMessage, editMessage, deleteMessage, deleteConversation  };
};


