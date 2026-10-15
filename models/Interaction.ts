import mongoose, { Schema, Model } from "mongoose";

const InteractionSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["admin", "manager", "employee"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["all", "managers", "team", "custom_users"],
      required: true,
      default: "all",
      index: true,
    },
    targetManagerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetManagerName: {
      type: String,
      default: "",
    },
    recipientIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal",
      index: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["image", "document", "none"],
      default: "none",
    },
    mediaName: {
      type: String,
      default: "",
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Interaction: Model<any> =
  mongoose.models.Interaction ||
  mongoose.model("Interaction", InteractionSchema);

export default Interaction;
