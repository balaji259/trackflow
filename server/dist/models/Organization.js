import mongoose, { Schema, Document, Model } from "mongoose";
const OrganizationSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
}, { timestamps: true });
const Organization = mongoose.models.Organization ||
    mongoose.model("Organization", OrganizationSchema);
export default Organization;
//# sourceMappingURL=Organization.js.map