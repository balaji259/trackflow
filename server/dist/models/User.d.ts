import mongoose, { Document, Model } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    clerkId: string;
    organizations: mongoose.Types.ObjectId[];
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map