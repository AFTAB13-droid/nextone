import mongoose, { Schema, Model } from "mongoose";
import { IQuery } from "@/lib/types";

const QueryResponseSchema = new Schema(
  {
    sender: {
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

const QuerySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Query title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Query description is required"],
    },
    category: {
      type: String,
      enum: ["technical", "clarification", "blocker", "resource", "other"],
      default: "clarification",
      index: true,
    },
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
      index: true,
    },
    raisedBy: {
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
    escalatedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    responses: {
      type: [QueryResponseSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Query: Model<IQuery> = mongoose.models.Query || mongoose.model<IQuery>("Query", QuerySchema);

export default Query;
