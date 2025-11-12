import express from "express";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import mongoose from "mongoose";

const router = express.Router();

// Helper function to get or create user with real info
async function getOrCreateUser(clerkUserId: string, email?: string, name?: string) {
  let user = await User.findOne({ clerkId: clerkUserId });
  
  if (!user) {
    // User doesn't exist, create with real data from Clerk
    user = new User({
      clerkId: clerkUserId,
      email: email || `user_${clerkUserId}@temp.com`,
      name: name || "User",
      organizations: [],
    });
    await user.save();
    console.log("New user created:", user);
  } else if (email || name) {
    // User exists but update info if provided
    let updated = false;
    if (email && user.email.includes('@temp.com')) {
      user.email = email;
      updated = true;
    }
    if (name && user.name === 'User') {
      user.name = name;
      updated = true;
    }
    if (updated) {
      await user.save();
      console.log("User info updated:", user);
    }
  }
  
  return user;
}

// GET - Fetch all organizations for a user
router.get("/", async (req, res) => {
  try {
    const { userId: clerkUserId, email, name } = req.query;
    
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    // Get or create user with real info
    const user = await getOrCreateUser(
      clerkUserId, 
      email as string, 
      name as string
    );

    const organizations = await Organization.find({ 
      members: user._id 
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ 
      message: "Error fetching organizations", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// POST - Create new organization
router.post("/", async (req, res) => {
  try {
    const { name, description, userId: clerkUserId, userEmail, userName } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Organization name is required" });
    }

    if (!clerkUserId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Get or create user with real info
    const user = await getOrCreateUser(clerkUserId, userEmail, userName);

    const newOrg = new Organization({
      name: name.trim(),
      description: description?.trim() || undefined,
      createdBy: user._id,
      members: [user._id],
    });

    await newOrg.save();

    if (!user.organizations.includes(newOrg._id as mongoose.Types.ObjectId)) {
      user.organizations.push(newOrg._id as mongoose.Types.ObjectId);
      await user.save();
    }

    await newOrg.populate('createdBy', 'name email');

    res.status(201).json(newOrg);
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({ 
      message: "Error creating organization", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;
