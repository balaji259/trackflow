import mongoose, { Document, Model } from "mongoose";
export interface IOrganization extends Document {
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    projects: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const Organization: Model<IOrganization>;
export default Organization;
//# sourceMappingURL=Organization.d.ts.map