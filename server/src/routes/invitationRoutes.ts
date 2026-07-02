// backend/routes/invitations.ts
import express from "express";
import crypto from "crypto";
import Invitation from "../models/Invitation.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

const router = express.Router();

// Generate unique token
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

import type { IUser } from "../models/User.js";

// Helper function (same as your organizations route)
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
    if (updated) {
      await user.save();
    }
  }
  
  return user;
}

// POST - Create invitation
router.post("/", async (req, res) => {
  try {
    const { 
      organizationId, 
      invitedEmail,
      role = 'member',
      userId: clerkUserId,
      userEmail,
      userName
    } = req.body;

    if (!organizationId || !clerkUserId) {
      console.error("❌ Missing required fields:", { organizationId, clerkUserId });
      return res.status(400).json({ 
        message: "organizationId and userId are required" 
      });
    }

    const inviter = await getOrCreateUser(clerkUserId, userEmail, userName);

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const isMember = organization.members.some(
      (memberId) => memberId.toString() === (inviter._id as any).toString()
    );
    
    const isAdmin = organization.admins.some(
      (adminId) => adminId.toString() === (inviter._id as any).toString()
    ) || organization.createdBy.toString() === (inviter._id as any).toString();

    if (!isAdmin) {
      console.error("❌ User is not an admin:", clerkUserId);
      return res.status(403).json({ 
        message: "You must be an admin to invite users" 
      });
    }

    let existingInvitationToResend = null;

    if (invitedEmail) {
      const existingUser = await User.findOne({ email: invitedEmail });
      if (existingUser) {
        const isAlreadyMember = organization.members.some(
          (memberId) => memberId.toString() === (existingUser._id as any).toString()
        );
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
        // If it exists, we will re-send the email and return the existing invite
        existingInvitationToResend = existingInvite;
      }
    }

    let invitation = existingInvitationToResend;

    if (!invitation) {
      invitation = new Invitation({
        organization: organizationId,
        invitedBy: inviter._id,
        invitedEmail: invitedEmail || undefined,
        token: generateInviteToken(),
        role,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await invitation.save();
    }

    await invitation.populate([
      { path: 'organization', select: 'name description' },
      { path: 'invitedBy', select: 'name email' }
    ]);

    const inviteLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${invitation.token}`;
    
    if (invitedEmail) {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD
            }
          });

          const mailOptions = {
            from: `"TrackFlow" <${process.env.GMAIL_USER}>`,
            to: invitedEmail,
            subject: `You've been invited to join ${organization.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                  <h2 style="color: #2563eb;">Join ${organization.name} on TrackFlow</h2>
                  <p style="color: #374151; font-size: 16px;">Hello,</p>
                  <p style="color: #374151; font-size: 16px;">You have been invited by <strong>${inviter.name}</strong> to join their workspace on TrackFlow.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLinkUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Accept Invitation
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${inviteLinkUrl}</p>
                </div>
              `
          };

          console.log(`⏳ Attempting to send email to ${invitedEmail}...`);
          await transporter.sendMail(mailOptions);
          console.log(`✅ Real Email sent successfully to ${invitedEmail} via Nodemailer!`);
        } catch (emailErr) {
          console.error("❌ Failed to send email via Nodemailer:", emailErr);
        }
      } else {
        console.warn(`\n⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is missing in your server/.env file!`);
        console.warn(`Simulated Email To: ${invitedEmail}`);
        console.warn(`Link: ${inviteLinkUrl}\n`);
      }
    }

    res.status(201).json({ 
      invitation,
      inviteLink: inviteLinkUrl
    });

  } catch (error) {
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

  } catch (error) {
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

    const isAlreadyMember = organization.members.some(
      (memberId) => memberId.toString() === (user._id as any).toString()
    );

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

    organization.members.push(user._id as mongoose.Types.ObjectId);
    if (invitation.role === 'admin') {
      organization.admins.push(user._id as mongoose.Types.ObjectId);
    }
    await organization.save();

    if (!user.organizations.includes(organization._id as mongoose.Types.ObjectId)) {
      user.organizations.push(organization._id as mongoose.Types.ObjectId);
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

  } catch (error) {
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

    const isMember = organization.members.some(
      (memberId) => memberId.toString() === (user._id as any).toString()
    );

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

  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ 
      message: "Error fetching invitations", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;
