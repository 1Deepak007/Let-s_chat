// middleware/chatUpload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure directory exists
const uploadDir = "uploads/chatMedia/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "chat-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadChatMedia = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for videos/audio
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif|mp4|webm|mp3|wav|pdf|docx|zip/;
    const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimeType = /image|video|audio|application\/pdf|application\/zip/.test(file.mimetype);

    if (extName || mimeType) {
      cb(null, true);
    } else {
      cb(new Error("File format not supported!"));
    }
  },
});

module.exports = uploadChatMedia;