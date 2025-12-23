// backend/models/Invitation.ts
import mongoose, { Schema, Document, Model } from "mongoose";
const InvitationSchema = new Schema({
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
}, { timestamps: true });
InvitationSchema.index({ organization: 1, status: 1 });
InvitationSchema.index({ token: 1, status: 1 });
const Invitation = mongoose.models.Invitation ||
    mongoose.model("Invitation", InvitationSchema);
export default Invitation;
//# sourceMappingURL=Invitation.js.map