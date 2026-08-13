require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const mediaRoutes = require("./routes/cloudinary");

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/media", mediaRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URL);
  const server = app.listen(process.env.PORT || 5000, () => console.log("API server running"));
  const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    socket.on("presence:join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("presence:changed", { userId, online: true });
    });
    socket.on("message:send", ({ recipientId, message }) => {
      const recipientSocket = onlineUsers.get(recipientId);
      if (recipientSocket) io.to(recipientSocket).emit("message:received", message);
    });
    socket.on("typing", ({ recipientId, isTyping }) => {
      const recipientSocket = onlineUsers.get(recipientId);
      if (recipientSocket) io.to(recipientSocket).emit("typing", { isTyping });
    });
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("presence:changed", { userId, online: false });
        }
      }
    });
  });
}

if (require.main === module) start().catch((error) => { console.error(error); process.exit(1); });
module.exports = app;
