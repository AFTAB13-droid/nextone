import mongoose, { Schema, Model } from "mongoose";
import { IUserDailyTelemetry } from "@/lib/types";

const UserDailyTelemetrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    activeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    idleSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    backgroundSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    deviceInfo: {
      os: { type: String, default: "Unknown OS" },
      browser: { type: String, default: "Unknown Browser" },
      screenResolution: { type: String, default: "" },
      ip: { type: String, default: "" },
    },
    dayStatus: {
      type: String,
      enum: ["full_day", "half_day", "short_day", "overtime", "active"],
      default: "active",
    },
    hourlyBlocks: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 unique record per user per calendar day
UserDailyTelemetrySchema.index({ userId: 1, date: -1 }, { unique: true });

const UserDailyTelemetry: Model<IUserDailyTelemetry> =
  mongoose.models.UserDailyTelemetry ||
  mongoose.model<IUserDailyTelemetry>("UserDailyTelemetry", UserDailyTelemetrySchema);

export default UserDailyTelemetry;
