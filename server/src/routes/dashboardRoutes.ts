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

// GET - Dashboard analytics
router.get("/", async (req, res) => {
  try {
    const { userId: clerkUserId, email, name } = req.query;
    
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const user = await getOrCreateUser(clerkUserId, email as string, name as string);

    // Get user's organizations
    const organizations = await Organization.find({ 
      members: user._id 
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    // Get organization IDs
    const orgIds = organizations.map(org => org._id);

    // Get all projects in user's organizations
    const projects = await Project.find({
      organizationId: { $in: orgIds }
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    // Get project IDs
    const projectIds = projects.map(p => p._id);

    // 1. Efficiently get Recent Tasks (only 10)
    const recentTasks = await Task.find({ projectId: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Compute Dashboard Stats using Aggregation
    const statsResult = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          myTasks: { $sum: { $cond: [{ $eq: ["$assignee.userId", user._id] }, 1, 0] } },
          todo: { $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          inReview: { $sum: { $cond: [{ $eq: ["$status", "in-review"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          myTodo: { $sum: { $cond: [{ $and: [{ $eq: ["$assignee.userId", user._id] }, { $eq: ["$status", "todo"] }] }, 1, 0] } },
          myInProgress: { $sum: { $cond: [{ $and: [{ $eq: ["$assignee.userId", user._id] }, { $eq: ["$status", "in-progress"] }] }, 1, 0] } },
          myInReview: { $sum: { $cond: [{ $and: [{ $eq: ["$assignee.userId", user._id] }, { $eq: ["$status", "in-review"] }] }, 1, 0] } },
          myCompleted: { $sum: { $cond: [{ $and: [{ $eq: ["$assignee.userId", user._id] }, { $eq: ["$status", "completed"] }] }, 1, 0] } },
          highestPriority: { $sum: { $cond: [{ $eq: ["$priority", "highest"] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] } },
          mediumPriority: { $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] } },
          lowPriority: { $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] } },
          lowestPriority: { $sum: { $cond: [{ $eq: ["$priority", "lowest"] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $and: [{ $lt: ["$dueDate", new Date()] }, { $ne: ["$status", "completed"] }] }, 1, 0] } },
        }
      }
    ]);

    const aggStats = statsResult[0] || {
      totalTasks: 0, myTasks: 0, todo: 0, inProgress: 0, inReview: 0, completed: 0,
      myTodo: 0, myInProgress: 0, myInReview: 0, myCompleted: 0,
      highestPriority: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0, lowestPriority: 0,
      overdue: 0
    };

    const stats = {
      totalOrganizations: organizations.length,
      totalProjects: projects.length,
      totalTasks: aggStats.totalTasks,
      myTasks: aggStats.myTasks,
      tasksByStatus: { todo: aggStats.todo, inProgress: aggStats.inProgress, inReview: aggStats.inReview, completed: aggStats.completed },
      myTasksByStatus: { todo: aggStats.myTodo, inProgress: aggStats.myInProgress, inReview: aggStats.myInReview, completed: aggStats.myCompleted },
      tasksByPriority: { highest: aggStats.highestPriority, high: aggStats.highPriority, medium: aggStats.mediumPriority, low: aggStats.lowPriority, lowest: aggStats.lowestPriority },
      overdueTasks: aggStats.overdue,
      completionRate: aggStats.totalTasks > 0 ? Math.round((aggStats.completed / aggStats.totalTasks) * 100) : 0,
    };

    // 3. Compute Project Stats using Aggregation
    const projectStatsResult = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: "$projectId",
          taskCount: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
        }
      }
    ]);
    const projectStatsMap = new Map(projectStatsResult.map(p => [p._id.toString(), p]));

    const projectsWithStats = projects.map(project => {
      const pStats = projectStatsMap.get(project._id.toString()) || { taskCount: 0, completedTasks: 0 };
      return {
        ...project.toObject(),
        taskCount: pStats.taskCount,
        completedTasks: pStats.completedTasks,
        completionRate: pStats.taskCount > 0 ? Math.round((pStats.completedTasks / pStats.taskCount) * 100) : 0,
      };
    });

    // 4. Compute Per-Member Stats using Aggregation
    const perMemberStatsResult = await Task.aggregate([
      { $match: { projectId: { $in: projectIds }, "assignee.userId": { $exists: true } } },
      {
        $group: {
          _id: "$assignee.userId",
          name: { $first: "$assignee.name" },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
        }
      },
      { $sort: { completed: -1 } }
    ]);
    const perMemberStats = perMemberStatsResult.map(m => ({
      name: m.name,
      total: m.total,
      completed: m.completed
    }));

    res.json({
      stats,
      organizations,
      projects: projectsWithStats,
      recentTasks,
      perMemberStats,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ 
      message: "Error fetching dashboard data", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;
