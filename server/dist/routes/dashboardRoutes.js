import express from "express";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";
const router = express.Router();
// Helper function to get or create user
async function getOrCreateUser(clerkUserId, email, name) {
    let user = await User.findOne({ clerkId: clerkUserId });
    if (!user) {
        user = new User({
            clerkId: clerkUserId,
            email: email || `user_${clerkUserId}@temp.com`,
            name: name || "User",
            organizations: [],
        });
        await user.save();
    }
    else if (email || name) {
        let updated = false;
        if (email && user.email.includes('@temp.com')) {
            user.email = email;
            updated = true;
        }
        if (name && user.name === 'User') {
            user.name = name;
            updated = true;
        }
        if (updated)
            await user.save();
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
        const user = await getOrCreateUser(clerkUserId, email, name);
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
        // Get all tasks in user's projects
        const allTasks = await Task.find({
            projectId: { $in: projectIds }
        });
        // Get tasks assigned to current user
        const myTasks = allTasks.filter(task => task.assignee?.userId?.toString() === user._id.toString());
        // Calculate statistics
        const stats = {
            totalOrganizations: organizations.length,
            totalProjects: projects.length,
            totalTasks: allTasks.length,
            myTasks: myTasks.length,
            // Task status breakdown
            tasksByStatus: {
                todo: allTasks.filter(t => t.status === 'todo').length,
                inProgress: allTasks.filter(t => t.status === 'in-progress').length,
                inReview: allTasks.filter(t => t.status === 'in-review').length,
                completed: allTasks.filter(t => t.status === 'completed').length,
            },
            // My tasks by status
            myTasksByStatus: {
                todo: myTasks.filter(t => t.status === 'todo').length,
                inProgress: myTasks.filter(t => t.status === 'in-progress').length,
                inReview: myTasks.filter(t => t.status === 'in-review').length,
                completed: myTasks.filter(t => t.status === 'completed').length,
            },
            // Task priority breakdown
            tasksByPriority: {
                highest: allTasks.filter(t => t.priority === 'highest').length,
                high: allTasks.filter(t => t.priority === 'high').length,
                medium: allTasks.filter(t => t.priority === 'medium').length,
                low: allTasks.filter(t => t.priority === 'low').length,
                lowest: allTasks.filter(t => t.priority === 'lowest').length,
            },
            // Overdue tasks
            overdueTasks: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
            // Completion rate
            completionRate: allTasks.length > 0
                ? Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100)
                : 0,
        };
        // Recent tasks (last 10)
        const recentTasks = allTasks
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
        // Projects with task counts
        const projectsWithStats = projects.map(project => {
            const projectTasks = allTasks.filter(t => t.projectId.toString() === project._id.toString());
            return {
                ...project.toObject(),
                taskCount: projectTasks.length,
                completedTasks: projectTasks.filter(t => t.status === 'completed').length,
                completionRate: projectTasks.length > 0
                    ? Math.round((projectTasks.filter(t => t.status === 'completed').length / projectTasks.length) * 100)
                    : 0,
            };
        });
        res.json({
            stats,
            organizations,
            projects: projectsWithStats,
            recentTasks,
        });
    }
    catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({
            message: "Error fetching dashboard data",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
export default router;
//# sourceMappingURL=dashboardRoutes.js.map