import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://g-chat-frontend.onrender.com"],
    methods: ["GET", "POST"]
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("\n=== New Connection ===");
  console.log("Socket ID:", socket.id);
  console.log("Handshake query:", socket.handshake.query);

  const userId = socket.handshake.query.userId;
  
  if (!userId) {
    console.error("Connection rejected: Missing userId");
    socket.emit("connection_error", { message: "User ID is required" });
    socket.disconnect(true);
    return;
  }

  console.log(`User connected - ID: ${userId}, Socket: ${socket.id}`);
  userSocketMap[userId] = socket.id;
  
  // Send updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  console.log("Online users:", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`\nUser disconnected - ID: ${userId}, Socket: ${socket.id}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Remaining online users:", Object.keys(userSocketMap));
  });
});

export { io, app, server };