import mongoose, { Document, Model } from "mongoose";
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
declare const Invitation: Model<IInvitation>;
export default Invitation;
//# sourceMappingURL=Invitation.d.ts.map