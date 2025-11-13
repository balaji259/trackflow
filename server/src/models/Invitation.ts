// backend/models/Invitation.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvitation extends Document {
  organization: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  invitedEmail?: string;
  token: string;
  role: 'member' | 'admin';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    organization: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true,
      index: true
    },
    invitedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    invitedEmail: { 
      type: String, 
      lowercase: true,
      trim: true
    },
    token: { 
      type: String, 
      required: true, 
      unique: true,
      index: true
    },
    role: { 
      type: String, 
      enum: ['member', 'admin'], 
      default: 'member' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'declined', 'expired'], 
      default: 'pending',
      index: true
    },
    expiresAt: { 
      type: Date, 
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

InvitationSchema.index({ organization: 1, status: 1 });
InvitationSchema.index({ token: 1, status: 1 });

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || 
  mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;
