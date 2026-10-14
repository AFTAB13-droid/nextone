import mongoose, { Schema, Model } from "mongoose";
import { ITarget } from "@/lib/types";

const TargetCommentSchema = new Schema(
  {
    author: {
      _id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      avatar: { type: String, default: "" },
    },
    message: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TargetSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    targetText: {
      type: String,
      required: true,
      trim: true,
    },
    progressNotes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "achieved", "partially_achieved"],
      default: "pending",
    },
    comments: {
      type: [TargetCommentSchema],
      default: [],
    },
    lastUpdatedTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so an employee has unique target per date
TargetSchema.index({ employee: 1, date: 1 }, { unique: true });

const Target: Model<ITarget> =
  mongoose.models.Target || mongoose.model<ITarget>("Target", TargetSchema);

export default Target;
