import mongoose, { Document } from "mongoose";
export interface IMessage extends Document {
    projectId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    userName: string;
    text: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any> | mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Message.d.ts.map