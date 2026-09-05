const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // ✅ Encrypted content storage
  encryptedContent: {
    encrypted: String,
    iv: String,
    salt: String,
    authTag: String,
  },
  // ⚠️ Legacy field - keep for backward compatibility, but don't use for new messages
  content: {
    type: String,
    default: '',
  },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "file"],
    required: true,
  },
  fileUrl: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  lastEditedAt: {
    type: Date,
    default: null,
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
}, { timestamps: true });

messageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);