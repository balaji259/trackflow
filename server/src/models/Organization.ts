import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Organization: Model<IOrganization> =
  mongoose.models.Organization || 
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;
