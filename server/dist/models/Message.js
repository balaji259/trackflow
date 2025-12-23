import mongoose, { Schema, Document } from "mongoose";
const MessageSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
//# sourceMappingURL=Message.js.map