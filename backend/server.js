const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");

const redisClient = require("./utils/redis");
const User = require("./models/User");
const Message = require("./models/Message");
const authenticateJWT = require("./middleware/authMiddleware");
const upload = require("./middleware/upload");

const cloudinary = require("cloudinary").v2;

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/getallusers", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

// database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Track online users: Map of userId -> Set of socketIds
const onlineUsersMap = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Automatically join user's room using decoded userId from middleware
  if (socket.userId) {
    const userIdStr = socket.userId.toString();
    socket.join(userIdStr);

    // Add socket to user's active sockets set
    if (!onlineUsersMap.has(userIdStr)) {
      onlineUsersMap.set(userIdStr, new Set());
    }
    onlineUsersMap.get(userIdStr).add(socket.id);

    // Broadcast updated online users list to everyone
    io.emit("onlineUsers", Array.from(onlineUsersMap.keys()));
    console.log(`Socket ${socket.id} joined room ${userIdStr}`);
  }

  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`${socket.id} manually joined room ${userId}`);
  });

  // --- Real-time Message Edit Relay ---
  socket.on("editMessage", (updatedMessage) => {
    if (!updatedMessage) return;

    // Extract receiver ID safely (whether it's an object or string)
    const receiverId = typeof updatedMessage.receiver === "object"
      ? updatedMessage.receiver?._id
      : updatedMessage.receiver;

    const senderId = typeof updatedMessage.sender === "object"
      ? updatedMessage.sender?._id
      : updatedMessage.sender;

    // Emit 'messageEdited' to both the recipient room and the sender room
    if (receiverId) {
      io.to(receiverId.toString()).emit("messageEdited", updatedMessage);
    }
    if (senderId) {
      io.to(senderId.toString()).emit("messageEdited", updatedMessage);
    }
  });

  // --- Real-time Message Send Relay (if not handled elsewhere) ---
  socket.on("sendMessage", (messageData) => {
    const receiverId = typeof messageData.receiver === "object"
      ? messageData.receiver?._id
      : messageData.receiver;

    if (receiverId) {
      io.to(receiverId.toString()).emit("receiveMessage", messageData);
    }
  });

  // --- Real-time Message Delete Relay ---
  socket.on("deleteMessage", (data) => {
    const { messageId, receiverId } = data;
    if (receiverId) {
      io.to(receiverId.toString()).emit("messageDeleted", { messageId });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    if (socket.userId) {
      const userIdStr = socket.userId.toString();
      if (onlineUsersMap.has(userIdStr)) {
        onlineUsersMap.get(userIdStr).delete(socket.id);
        if (onlineUsersMap.get(userIdStr).size === 0) {
          onlineUsersMap.delete(userIdStr);
        }
      }
      // Broadcast updated online users list
      io.emit("onlineUsers", Array.from(onlineUsersMap.keys()));
    }
  });
});

const chatRoutes = require("./routes/chatRoutes")(io);
const friendRoutes = require("./routes/friendRoutes")(io);

app.use("/api/auth", authRoutes);
app.use("/api/chat", authenticateJWT, chatRoutes);
app.use("/api/friends", authenticateJWT, friendRoutes);
app.use("/api/profile", authenticateJWT, profileRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", async(req,res) => {
//   try{
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'lets_chat_profiles',
//     });

//     //Return secure url
//     res.json({
//       url: result.secure_url,
//       public_id: result.public_id
//     });
//   }
//   catch(error){
//     console.log(error);
//     res.status(500).json({ error: error.message });
//   }
// });

server.listen(5000, () => {
  console.log("Server running on port 5000");
});

