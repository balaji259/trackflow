import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  status: 'active' | 'archived' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: { 
      type: String, 
      enum: ['active', 'archived', 'completed'], 
      default: 'active' 
    },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || 
  mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
