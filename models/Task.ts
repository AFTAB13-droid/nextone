import mongoose, { Schema, Model } from "mongoose";
import { ITask } from "@/lib/types";

const TaskActivitySchema = new Schema(
  {
    action: { type: String, required: true },
    by: {
      _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TaskCommentSchema = new Schema(
  {
    author: {
      _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    message: { type: String, required: true },
    attachments: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TaskSchema = new Schema(
  {
    taskId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    managerInCharge: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "assigned",
        "in_progress",
        "on_hold",
        "in_review",
        "completed",
        "cancelled",
        "pending",
        "blocked",
      ],
      default: "assigned",
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [String],
      default: [],
    },
    activityLogs: {
      type: [TaskActivitySchema],
      default: [],
    },
    comments: {
      type: [TaskCommentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
