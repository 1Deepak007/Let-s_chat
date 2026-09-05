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

      // Safe string-based friendship check (handles both String & ObjectId entries)
      const senderIdStr = senderObjId.toString();
      const receiverIdStr = receiverObjId.toString();

      const areFriends =
        senderUser.friends.some((f) => f.toString() === receiverIdStr) ||
        receiverUser.friends.some((f) => f.toString() === senderIdStr);

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
        .populate({
          path: "replyTo",
          populate: { path: "sender", select: "username firstname lastname profilePicture _id" },
        })
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
    try {
      const { receiver, content, messageType, replyTo } = req.body;
      const sender = req.user.id || req.user._id;

      let fileUrl = null;
      let finalMessageType = messageType || "text";

      if (replyTo && !mongoose.Types.ObjectId.isValid(replyTo)) {
        return res.status(400).json({ message: "Invalid reply message ID." });
      }

      // If a file was uploaded, assign its relative path
      if (req.file) {
        fileUrl = fileUrl;

        // Auto-detect type if not provided explicitly
        if (req.file.mimetype.startsWith("image/")) finalMessageType = "image";
        else if (req.file.mimetype.startsWith("video/")) finalMessageType = "video";
        else if (req.file.mimetype.startsWith("audio/")) finalMessageType = "audio";
        else finalMessageType = "file";
      }

      const newMessage = new Message({
        sender,
        receiver,
        content: content || "",
        messageType: finalMessageType,
        fileUrl,
        replyTo: replyTo || null,
      });

      await newMessage.save();

      const populatedMsg = await Message.findById(newMessage._id)
        .populate("sender", "username firstname lastname profilePicture")
        .populate("receiver", "username firstname lastname profilePicture")
        .populate({
          path: "replyTo",
          populate: { path: "sender", select: "username firstname lastname profilePicture _id" },
        });

      // Socket relay
      io.to(receiver.toString()).emit("receiveMessage", populatedMsg);

      res.status(201).json({ success: true, chatMessage: populatedMsg });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const editMessage = async (req, res) => {
    const { messageId, newContent, content } = req.body;
    const updatedText = newContent !== undefined ? newContent : content;

    if (!updatedText || typeof updatedText !== "string" || !updatedText.trim()) {
      return res.status(400).json({ message: "Updated message content cannot be empty." });
    }

    if (!messageId) {
      return res.status(400).json({ message: "messageId is required." });
    }

    try {
      if (!mongoose.Types.ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: "Invalid message ID format." });
      }

      const message = await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      const currentUserId = req.user?._id?.toString() || req.user?.id;
      if (message.sender.toString() !== currentUserId) {
        return res.status(403).json({ message: "Not authorized to edit this message." });
      }

      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const msgTime = message.timestamp || message.createdAt;
      if (msgTime < tenMinutesAgo) {
        return res.status(400).json({ message: "Messages can only be edited within 10 minutes of sending." });
      }

      message.content = updatedText.trim();
      message.isEdited = true;
      message.lastEditedAt = new Date();
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username firstname lastname profilePicture _id")
        .populate("receiver", "username firstname lastname profilePicture _id");

      const socketIo = req.app.get("io") || global.io;
      if (socketIo) {
        socketIo.to(message.sender.toString()).emit("messageEdited", populatedMessage);
        socketIo.to(message.receiver.toString()).emit("messageEdited", populatedMessage);
      }

      return res.status(200).json({
        message: "Message edited successfully",
        data: populatedMessage,
        updatedMessage: populatedMessage,
      });
    } catch (err) {
      console.error("Error in editMessage:", err);
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  const toggleReaction = async (req, res) => {
    const { messageId, emoji } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(messageId) || typeof emoji !== "string" || !emoji.trim()) {
      return res.status(400).json({ message: "A valid messageId and emoji are required." });
    }

    try {
      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found." });
      }

      const userIdString = userId.toString();
      const isParticipant = [message.sender, message.receiver]
        .some((participantId) => participantId.toString() === userIdString);

      if (!isParticipant) {
        return res.status(403).json({ message: "You cannot react to this message." });
      }

      const existingReaction = message.reactions.find(
        (reaction) => reaction.userId.toString() === userIdString
      );

      if (existingReaction?.emoji === emoji.trim()) {
        message.reactions = message.reactions.filter(
          (reaction) => reaction.userId.toString() !== userIdString
        );
      } else if (existingReaction) {
        existingReaction.emoji = emoji.trim();
      } else {
        message.reactions.push({ userId, emoji: emoji.trim() });
      }

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username firstname lastname profilePicture _id")
        .populate("receiver", "username firstname lastname profilePicture _id")
        .lean();

      io.to(message.sender.toString()).emit("messageReaction", {
        messageId: message._id.toString(),
        reactions: populatedMessage.reactions,
      });
      io.to(message.receiver.toString()).emit("messageReaction", {
        messageId: message._id.toString(),
        reactions: populatedMessage.reactions,
      });

      return res.status(200).json({
        messageId: message._id.toString(),
        reactions: populatedMessage.reactions,
      });
    } catch (err) {
      console.error("Error toggling message reaction:", err);
      return res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

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

      res.status(200).json({ message: "Message deleted", data: populatedMessage });
    } catch (err) {
      console.error("Error in deleteMessage:", err);
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  const deleteConversation = async (req, res) => {
    const { friendId } = req.body;
    const userId = req.user.id;

    try {
      if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return res.status(400).json({ message: "Invalid friend ID format" });
      }

      const userObjId = new mongoose.Types.ObjectId(userId);
      const friendObjId = new mongoose.Types.ObjectId(friendId);

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

      io.to(userId).emit("conversationDeleted", { friendId });
      io.to(friendId).emit("conversationDeleted", { friendId: userId });

      res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (err) {
      console.error("Error in deleteConversation:", err);
      res.status(500).json({ message: `Server error: ${err.message}` });
    }
  };

  return {
    getMessages,
    sendMessage,
    editMessage,
    toggleReaction,
    deleteMessage,
    deleteConversation,
  };
};