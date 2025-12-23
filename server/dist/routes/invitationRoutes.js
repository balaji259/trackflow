// backend/routes/invitations.ts
import express from "express";
import crypto from "crypto";
import Invitation from "../models/Invitation.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import mongoose from "mongoose";
const router = express.Router();
// Generate unique token
function generateInviteToken() {
    return crypto.randomBytes(32).toString('hex');
}
// Helper function (same as your organizations route)
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
        if (updated) {
            await user.save();
        }
    }
    return user;
}
// POST - Create invitation
router.post("/", async (req, res) => {
    try {
        const { organizationId, invitedEmail, role = 'member', userId: clerkUserId, userEmail, userName } = req.body;
        if (!organizationId || !clerkUserId) {
            return res.status(400).json({
                message: "organizationId and userId are required"
            });
        }
        const inviter = await getOrCreateUser(clerkUserId, userEmail, userName);
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        const isMember = organization.members.some((memberId) => memberId.toString() === inviter._id.toString());
        if (!isMember) {
            return res.status(403).json({
                message: "You don't have permission to invite users"
            });
        }
        if (invitedEmail) {
            const existingUser = await User.findOne({ email: invitedEmail });
            if (existingUser) {
                const isAlreadyMember = organization.members.some((memberId) => memberId.toString() === existingUser._id.toString());
                if (isAlreadyMember) {
                    return res.status(400).json({
                        message: "User is already a member"
                    });
                }
            }
            const existingInvite = await Invitation.findOne({
                organization: organizationId,
                invitedEmail,
                status: 'pending',
                expiresAt: { $gt: new Date() }
            });
            if (existingInvite) {
                return res.status(400).json({
                    message: "An active invitation already exists for this email"
                });
            }
        }
        const invitation = new Invitation({
            organization: organizationId,
            invitedBy: inviter._id,
            invitedEmail: invitedEmail || undefined,
            token: generateInviteToken(),
            role,
            status: 'pending',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await invitation.save();
        await invitation.populate([
            { path: 'organization', select: 'name description' },
            { path: 'invitedBy', select: 'name email' }
        ]);
        res.status(201).json({
            invitation,
            inviteLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${invitation.token}`
        });
    }
    catch (error) {
        console.error("Error creating invitation:", error);
        res.status(500).json({
            message: "Error creating invitation",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
// GET - Get invitation by token
router.get("/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await Invitation.findOne({ token })
            .populate('organization', 'name description')
            .populate('invitedBy', 'name email');
        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found" });
        }
        if (invitation.expiresAt < new Date()) {
            if (invitation.status === 'pending') {
                invitation.status = 'expired';
                await invitation.save();
            }
            return res.status(410).json({ message: "Invitation has expired" });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                message: `Invitation has been ${invitation.status}`
            });
        }
        res.json({ invitation });
    }
    catch (error) {
        console.error("Error fetching invitation:", error);
        res.status(500).json({
            message: "Error fetching invitation",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
// POST - Accept invitation
router.post("/:token/accept", async (req, res) => {
    try {
        const { token } = req.params;
        const { userId: clerkUserId, email, name } = req.body;
        if (!clerkUserId) {
            return res.status(400).json({ message: "userId is required" });
        }
        const user = await getOrCreateUser(clerkUserId, email, name);
        const invitation = await Invitation.findOne({ token });
        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found" });
        }
        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(410).json({ message: "Invitation has expired" });
        }
        if (invitation.status !== 'pending') {
            return res.status(400).json({
                message: `Invitation has already been ${invitation.status}`
            });
        }
        if (invitation.invitedEmail && invitation.invitedEmail !== user.email) {
            return res.status(403).json({
                message: "This invitation is for a different email address"
            });
        }
        const organization = await Organization.findById(invitation.organization);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        const isAlreadyMember = organization.members.some((memberId) => memberId.toString() === user._id.toString());
        if (isAlreadyMember) {
            invitation.status = 'accepted';
            await invitation.save();
            return res.status(200).json({
                message: "You are already a member",
                organization: {
                    id: organization._id,
                    name: organization.name,
                    description: organization.description
                }
            });
        }
        organization.members.push(user._id);
        await organization.save();
        if (!user.organizations.includes(organization._id)) {
            user.organizations.push(organization._id);
            await user.save();
        }
        invitation.status = 'accepted';
        await invitation.save();
        res.json({
            message: "Successfully joined organization",
            organization: {
                id: organization._id,
                name: organization.name,
                description: organization.description
            }
        });
    }
    catch (error) {
        console.error("Error accepting invitation:", error);
        res.status(500).json({
            message: "Error accepting invitation",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
// GET - List invitations for organization
router.get("/organization/:organizationId", async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { userId: clerkUserId } = req.query;
        if (!clerkUserId || typeof clerkUserId !== 'string') {
            return res.status(400).json({ message: "userId is required" });
        }
        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        const isMember = organization.members.some((memberId) => memberId.toString() === user._id.toString());
        if (!isMember) {
            return res.status(403).json({
                message: "You don't have permission to view invitations"
            });
        }
        const invitations = await Invitation.find({
            organization: organizationId,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        })
            .populate('invitedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({ invitations });
    }
    catch (error) {
        console.error("Error fetching invitations:", error);
        res.status(500).json({
            message: "Error fetching invitations",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
export default router;
//# sourceMappingURL=invitationRoutes.js.map