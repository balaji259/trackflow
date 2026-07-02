import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  action: string;
  targetName: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  targetName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export default ActivityLog;
