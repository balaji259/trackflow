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
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Organization from "./models/Organization.js";

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
  socket.on("join_project", async (data: { projectId: string, clerkUserId: string }) => {
    try {
      const { projectId, clerkUserId } = data;
      const user = await User.findOne({ clerkId: clerkUserId });
      const project = await Project.findById(projectId);
      if (user && project) {
        const org = await Organization.findById(project.organizationId);
        if (org && org.members.some(m => m.toString() === (user as any)._id.toString())) {
          socket.join(`project_${projectId}`);
          console.log(`User ${socket.id} joined project: ${projectId}`);
          return;
        }
      }
      socket.emit("message_error", { error: "Unauthorized" });
    } catch (e) {
      console.error(e);
    }
  });

  // Join a task room
  socket.on("join_task", async (data: { taskId: any, clerkUserId: string }) => {
    console.log("join_task received raw data:", data);
    try {
      let { taskId, clerkUserId } = data;
      console.log("join_task destructured taskId:", taskId, "typeof:", typeof taskId);
      
      // Defensively parse taskId in case frontend sends it as an object
      if (typeof taskId === "object" && taskId !== null) {
        taskId = taskId.taskId || taskId.id || taskId._id || String(taskId);
      }
      const user = await User.findOne({ clerkId: clerkUserId });
      const task = await Task.findById(taskId);
      if (user && task) {
        const project = await Project.findById(task.projectId);
        if (project) {
          const org = await Organization.findById(project.organizationId);
          if (org && org.members.some(m => m.toString() === (user as any)._id.toString())) {
            socket.join(`task_${taskId}`);
            console.log(`User ${socket.id} joined task: ${taskId}`);
            return;
          }
        }
      }
      socket.emit("message_error", { error: "Unauthorized" });
    } catch (e) {
      console.error(e);
    }
  });

  // Handle new message
  // In your Socket.io handler
socket.on("send_message", async (data) => {
  console.log("send_message received raw data:", data);
  try {
    let { projectId, taskId, text, clerkUserId } = data;
    console.log("send_message parsed taskId:", taskId, "typeof:", typeof taskId);

    // Defensively parse taskId in case frontend sends it as an object
    if (typeof taskId === "object" && taskId !== null) {
      taskId = taskId.taskId || taskId.id || taskId._id || String(taskId);
    }

    if (!clerkUserId || !text?.trim()) {
      socket.emit("message_error", { error: "Invalid message data" });
      return;
    }

    const user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
      socket.emit("message_error", { error: "User not found" });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      socket.emit("message_error", { error: "Project not found" });
      return;
    }

    const org = await Organization.findById(project.organizationId);
    if (!org || !org.members.some(m => m.toString() === (user as any)._id.toString())) {
      socket.emit("message_error", { error: "Unauthorized to send messages here" });
      return;
    }

    const message = await Message.create({
      projectId,
      taskId: taskId || undefined,
      userId: (user as any)._id,
      userName: user.name,
      text: text.trim(),
    });

    // Emit to task room if taskId is present, else project room
    const room = taskId ? `task_${taskId}` : `project_${projectId}`;
    io.to(room).emit("new_message", {
      _id: message._id,
      userName: message.userName,
      userId: clerkUserId,
      text: message.text,
      createdAt: message.createdAt,
    });

    console.log(`Message sent to ${room}:`, text);
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
