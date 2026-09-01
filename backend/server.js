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

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
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
    origin: "http://localhost:5173/",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.join(socket.userId);
    next();
  } catch (err) {
    return next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  // This is the crucial block!
  console.log("A user connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`${socket.id} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const chatRoutes = require("./routes/chatRoutes")(io);
const friendRoutes = require("./routes/friendRoutes")(io);

app.use("/api/auth", authRoutes);
app.use("/api/chat", authenticateJWT, chatRoutes);
app.use("/api/friends", authenticateJWT, friendRoutes);
app.use("/api/profile", authenticateJWT, profileRoutes(upload));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


server.listen(5000, () => {
  console.log("Server running on port 5000");
});
