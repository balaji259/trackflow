import mongoose, { Schema, Document, Model } from "mongoose";
const ProjectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    status: {
        type: String,
        enum: ['active', 'archived', 'completed'],
        default: 'active'
    },
}, { timestamps: true });
const Project = mongoose.models.Project ||
    mongoose.model("Project", ProjectSchema);
export default Project;
//# sourceMappingURL=Project.js.map