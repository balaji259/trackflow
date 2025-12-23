import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./db/connection.js";
import { env } from "./config/env.js";
import organizationRoute from "./routes/organizationRoute.js";
import projectRoutes from "./routes/projectRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import taskRoutes from './routes/taskRoutes.js'; 
import dashboardRoutes from "./routes/dashboardRoutes.js";
import Message from "./models/Message.js";
import User from "./models/User.js";

const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Routes
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/organizations", organizationRoute);
app.use("/api/projects", projectRoutes);
app.use("/api/invitations", invitationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Join a project room
  socket.on("join_project", (projectId: string) => {
    socket.join(`project_${projectId}`);
    console.log(`User ${socket.id} joined project: ${projectId}`);
  });

  // Handle new message
  // In your Socket.io handler
socket.on("send_message", async (data) => {
  try {
    const { projectId, text, clerkUserId } = data;

    if (!clerkUserId || !text?.trim()) {
      socket.emit("message_error", { error: "Invalid message data" });
      return;
    }

    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      socket.emit("message_error", { error: "User not found" });
      return;
    }

    const message = await Message.create({
      projectId,
      userId: user._id,
      userName: user.name,
      text: text.trim(),
    });

    // ✅ FIX: Send clerkId so frontend can compare
    io.to(`project_${projectId}`).emit("new_message", {
      _id: message._id,
      userName: message.userName,
      userId: clerkUserId,  // ✅ Send Clerk user ID
      text: message.text,
      createdAt: message.createdAt,
    });

    console.log(`Message sent to project ${projectId}:`, text);
  } catch (error) {
    console.error("Error sending message:", error);
    socket.emit("message_error", { error: "Failed to send message" });
  }
});

  // Leave project room
  // socket.on("leave_project", (projectId: string) => {
  //   socket.leave(`project_${projectId}`);
  //   console.log(`User ${socket.id} left project: ${projectId}`);
  // });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Connect to DB and start server
connectDB().then(() => {
  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
  });
});
