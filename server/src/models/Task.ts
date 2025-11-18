import mongoose, { Schema, Document, Model, Types } from "mongoose";

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

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'completed'],
      default: 'todo',
      required: true,
    },
    priority: {
      type: String,
      enum: ['lowest', 'low', 'medium', 'high', 'highest'],
      default: 'medium',
      required: true,
    },
    assignee: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      email: { type: String },
    },
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    createdBy: {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Indexes for efficient queries
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ organizationId: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
