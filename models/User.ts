import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/lib/types";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
      required: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    department: {
      type: String,
      default: "General",
      trim: true,
    },
    designation: {
      type: String,
      default: "Team Member",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    firstLoginCompleted: {
      type: Boolean,
      default: false,
    },
    firstLoginAt: {
      type: Date,
      default: null,
    },
    privacyPolicyAcceptedAt: {
      type: Date,
      default: null,
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: ["active", "idle", "offline"],
      default: "offline",
    },
    currentPath: {
      type: String,
      default: "",
    },
    currentDevice: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model across HMR in Next.js
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
