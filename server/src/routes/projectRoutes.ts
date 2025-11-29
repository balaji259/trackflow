// ✅ NEW
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Project from "../models/Project.js";
import Message from "../models/Message.js";

import type { IUser } from "../models/User.js";
import type { IOrganization } from "../models/Organization.js";
import type { IProject } from "../models/Project.js";
import express from "express";
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

// GET - Fetch all projects in an organization
router.get("/:organizationId", async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { userId: clerkUserId, email, name } = req.query;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    // Validate organization ID
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: "Invalid organization ID" });
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

    // Fetch all projects for this organization
    const projects = await Project.find({ organizationId })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ 
      message: "Error fetching projects", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// POST - Create new project
router.post("/:organizationId", async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { name, description, userId: clerkUserId, userEmail, userName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }

    if (!clerkUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Validate organization ID
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ message: "Invalid organization ID" });
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

    // Create new project
    const newProject = new Project({
      name: name.trim(),
      description: description?.trim() || undefined,
      organizationId: new mongoose.Types.ObjectId(organizationId),
      createdBy: user._id,
      members: [user._id],
      status: 'active',
    });

    await newProject.save();

    // Add project to organization's projects array
    
    if (!organization.projects.some(projectId => projectId.toString() === newProject._id.toString())) {
      organization.projects.push(newProject._id as mongoose.Types.ObjectId);
      await organization.save();
    }

    await newProject.populate('createdBy', 'name email');

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ 
      message: "Error creating project", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// DELETE - Delete a project
router.delete("/:organizationId/:projectId", async (req, res) => {
  try {
    const { organizationId, projectId } = req.params;
    const { userId: clerkUserId } = req.query;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const user = await User.findOne({ clerkId: clerkUserId }) as IUser | null;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find project and check ownership
    const project = await Project.findById(projectId) as IProject | null;
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.createdBy.toString() !== (user._id as mongoose.Types.ObjectId).toString()) {
      return res.status(403).json({ message: "Only project creator can delete the project" });
    }

    // Remove project from organization
    await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { projects: projectId } }
    );

    // Delete project
    await Project.findByIdAndDelete(projectId);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      message: "Error deleting project", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});





// GET last 30 messages for a project (KEEP THIS - for initial load)
// router.get("/:projectId/messages", async (req, res) => {
//   const messages = await Message.find({ projectId: req.params.projectId })
//     .sort({ createdAt: -1 })
//     .limit(30)
//     .lean();
//   res.json({ messages: messages.reverse() });
// });


// In projectRoutes.js GET endpoint
router.get("/:projectId/messages", async (req, res) => {
  const messages = await Message.find({ projectId: req.params.projectId })
    .populate('userId', 'clerkId')  // ✅ Populate clerkId
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  
  // ✅ Map to include clerkId
  const messagesWithClerkId = messages.map(msg => ({
    _id: msg._id,
    userName: msg.userName,
    userId: msg.userId?.clerkId || '',  // ✅ Use Clerk ID
    text: msg.text,
    createdAt: msg.createdAt
  }));
  
  res.json({ messages: messagesWithClerkId.reverse() });
});



export default router;
