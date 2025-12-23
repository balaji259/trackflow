import mongoose, { Document, Model } from "mongoose";
export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    tasks: mongoose.Types.ObjectId[];
    status: 'active' | 'archived' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}
declare const Project: Model<IProject>;
export default Project;
//# sourceMappingURL=Project.d.ts.map