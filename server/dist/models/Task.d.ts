import { Document, Model, Types } from "mongoose";
export interface ITask extends Document {
    _id: Types.ObjectId;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'in-review' | 'completed';
    priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
    assignee?: {
        userId: Types.ObjectId;
        name: string;
        email: string;
    };
    projectId: Types.ObjectId;
    organizationId: Types.ObjectId;
    createdBy: {
        userId: Types.ObjectId;
        name: string;
        email: string;
    };
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const Task: Model<ITask>;
export default Task;
//# sourceMappingURL=Task.d.ts.map