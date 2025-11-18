import express from "express";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import type { IUser } from "../models/User.js";
import type { IOrganization } from "../models/Organization.js";
import type { IProject } from "../models/Project.js";
import type { ITask } from "../models/Task.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper function to get or create user
async function getOrCreateUser(clerkUserId: string, email?: string, name?: string): Promise<IUser> {
  let user = await User.findOne({ clerkId: clerkUserId });
  
  if (!user) {
    user = new User({
      clerkId: clerkUserId,
      email: email || `user_${clerkUserId}@temp.com`,
      name: name || "User",
      organizations: [],
    });
    await user.save();
  } else if (email || name) {
    let updated = false;
    if (email && user.email.includes('@temp.com')) {
      user.email = email;
      updated = true;
    }
    if (name && user.name === 'User') {
      user.name = name;
      updated = true;
    }
    if (updated) await user.save();
  }
  
  return user;
}

// GET - Fetch all tasks for a project
router.get("/:organizationId/:projectId", async (req, res) => {
  try {
    const { organizationId, projectId } = req.params;
    const { userId: clerkUserId, email, name } = req.query;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const user = await getOrCreateUser(clerkUserId, email as string, name as string);

    // Check if user is a member of the organization
    const organization = await Organization.findById(organizationId) as IOrganization | null;
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember = organization.members.some(
      (memberId) => memberId.toString() === (user._id as mongoose.Types.ObjectId).toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this organization" });
    }

    // Verify project exists and belongs to organization
    const project = await Project.findOne({ 
      _id: projectId, 
      organizationId 
    }) as IProject | null;
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch all tasks for this project
    const tasks = await Task.find({ 
      projectId,
      organizationId 
    }).sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ 
      message: "Error fetching tasks", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// POST - Create new task
router.post("/:organizationId/:projectId", async (req, res) => {
  try {
    const { organizationId, projectId } = req.params;
    const { 
      title, 
      description, 
      priority, 
      status, 
      assignee, 
      dueDate,
      userId: clerkUserId, 
      userEmail, 
      userName 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    if (!clerkUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: "Invalid organization ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const user = await getOrCreateUser(clerkUserId, userEmail, userName);

    // Check if user is a member of the organization
    const organization = await Organization.findById(organizationId) as IOrganization | null;
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember = organization.members.some(
      (memberId) => memberId.toString() === (user._id as mongoose.Types.ObjectId).toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this organization" });
    }

    // Verify project exists
    const project = await Project.findOne({ 
      _id: projectId, 
      organizationId 
    }) as IProject | null;
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create new task
    const newTask = new Task({
      title: title.trim(),
      description: description?.trim() || undefined,
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || undefined,
      projectId: new mongoose.Types.ObjectId(projectId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      createdBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await newTask.save();

    // Add task to project's tasks array
    if (!project.tasks.some(taskId => taskId.toString() === newTask._id.toString())) {
      project.tasks.push(newTask._id as mongoose.Types.ObjectId);
      await project.save();
    }

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ 
      message: "Error creating task", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// DELETE - Delete a task
router.delete("/:organizationId/:projectId/:taskId", async (req, res) => {
  try {
    const { organizationId, projectId, taskId } = req.params;
    const { userId: clerkUserId } = req.query;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const user = await User.findOne({ clerkId: clerkUserId }) as IUser | null;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find task and check ownership
    const task = await Task.findById(taskId) as ITask | null;
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.createdBy.userId.toString() !== (user._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: "Only task creator can delete the task" });
    }

    // Remove task from project
    await Project.findByIdAndUpdate(
      projectId,
      { $pull: { tasks: taskId } }
    );

    // Delete task
    await Task.findByIdAndDelete(taskId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ 
      message: "Error deleting task", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;
