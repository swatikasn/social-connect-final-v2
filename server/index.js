const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require('./models/userModel');
const Message = require('./models/messageModel');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

async function resetAndVerifyDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB Connection Successful");
    
    // Delete all existing data
    await User.deleteMany({});
    await Message.deleteMany({});
    
    // Verify no users exist
    const userCount = await User.countDocuments();
    const messageCount = await Message.countDocuments();
    
    if (userCount === 0 && messageCount === 0) {
      console.log('Database is clean - no users or messages exist');
      return true;
    } else {
      console.error(`Database not clean! Found ${userCount} users and ${messageCount} messages`);
      return false;
    }
  } catch (error) {
    console.error('Database reset error:', error);
    return false;
  }
}

// Only start server if database is clean
resetAndVerifyDatabase().then((isDatabaseClean) => {
  if (!isDatabaseClean) {
    console.error('Shutting down - database not clean');
    process.exit(1);
  }
  
  // Continue with server setup
  const authRoutes = require("./routes/auth");
  const messageRoutes = require("./routes/messages");
  
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
  
  // Add delete user endpoint
  app.delete("/api/users/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      // Delete user's messages
      await Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });
      // Delete user
      await User.findByIdAndDelete(userId);
      // Remove from online users if they're connected
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting user" });
    }
  });
  
  const server = app.listen(5000, () => {
    console.log("Server started on port 5000");
  });
  
  // Socket.io setup
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  });
});