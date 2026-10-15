import connectDB from "@/lib/mongodb";
import Interaction from "@/models/Interaction";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { UserRole } from "@/lib/types";

export interface CreateInteractionInput {
  senderId: string;
  senderRole: UserRole;
  targetType: "all" | "managers" | "team" | "custom_users";
  targetManagerId?: string;
  recipientIds?: string[];
  subject: string;
  content: string;
  priority?: "normal" | "important" | "urgent";
  mediaUrl?: string;
  mediaType?: "image" | "document" | "none";
  mediaName?: string;
}

export class InteractionService {
  /**
   * Create an interaction / broadcast message and notify recipients
   */
  static async createInteraction(data: CreateInteractionInput) {
    await connectDB();

    let resolvedRecipients: string[] = [];
    let managerName = "";

    if (data.targetType === "all") {
      // Broadcast to entire organization except sender
      const allActive = await User.find({
        isActive: true,
        _id: { $ne: data.senderId },
      }).select("_id");
      resolvedRecipients = allActive.map((u) => u._id.toString());
    } else if (data.targetType === "managers") {
      // Broadcast to all active managers
      const managers = await User.find({
        role: "manager",
        isActive: true,
        _id: { $ne: data.senderId },
      }).select("_id");
      resolvedRecipients = managers.map((u) => u._id.toString());
    } else if (data.targetType === "team") {
      // Broadcast to specific manager's team
      const managerId =
        data.senderRole === "manager" ? data.senderId : data.targetManagerId;

      if (!managerId) {
        throw new Error("Manager ID is required for team target");
      }

      const mgr = await User.findById(managerId).select("name");
      if (mgr) {
        managerName = `${mgr.name}'s Team`;
      }

      const subordinates = await User.find({
        managerId,
        isActive: true,
      }).select("_id");

      resolvedRecipients = subordinates.map((u) => u._id.toString());

      // If Admin is sending to a manager's team, also include the manager
      if (
        data.senderRole === "admin" &&
        !resolvedRecipients.includes(managerId)
      ) {
        resolvedRecipients.push(managerId);
      }
    } else if (data.targetType === "custom_users") {
      // Custom selected recipients
      if (!data.recipientIds || data.recipientIds.length === 0) {
        throw new Error("At least one recipient must be selected");
      }
      resolvedRecipients = Array.from(
        new Set(
          data.recipientIds.filter((id) => id && id !== data.senderId)
        )
      );
    }

    if (resolvedRecipients.length === 0) {
      throw new Error("No eligible recipients found for this target selection");
    }

    // Create the interaction message
    const interaction = await Interaction.create({
      sender: data.senderId,
      senderRole: data.senderRole,
      targetType: data.targetType,
      targetManagerId: data.targetManagerId || (data.senderRole === "manager" ? data.senderId : null),
      targetManagerName: managerName,
      recipientIds: resolvedRecipients,
      subject: data.subject,
      content: data.content,
      priority: data.priority || "normal",
      mediaUrl: data.mediaUrl || "",
      mediaType: data.mediaType || (data.mediaUrl ? "image" : "none"),
      mediaName: data.mediaName || "",
      readBy: [data.senderId],
    });

    // Push real-time in-app notifications to all recipients
    const notifSnippet =
      data.content.length > 80
        ? data.content.substring(0, 80) + "..."
        : data.content;

    const notifBatch = resolvedRecipients.map((recId) => ({
      recipient: recId,
      title: `Broadcast: ${data.subject}`,
      message: notifSnippet,
      link: "/interactions",
      type: "system",
      isRead: false,
    }));

    if (notifBatch.length > 0) {
      Notification.insertMany(notifBatch).catch((err) =>
        console.error("Failed to insert broadcast notifications:", err)
      );
    }

    return interaction;
  }

  /**
   * Get inbox & sent interactions for a user, plus directories for composition
   */
  static async getInteractions(userId: string, role: UserRole) {
    await connectDB();

    // 1. Fetch Inbox messages
    const orConditions: any[] = [
      { recipientIds: userId },
      { targetType: "all", sender: { $ne: userId } },
    ];

    if (role === "manager") {
      orConditions.push({ targetType: "managers", sender: { $ne: userId } });
    }

    const inbox = await Interaction.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .populate("sender", "name email role avatar gender designation")
      .lean();

    // 2. Fetch Sent messages (for Admin and Manager)
    let sent: any[] = [];
    if (role === "admin" || role === "manager") {
      sent = await Interaction.find({ sender: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "name email role avatar gender designation")
        .populate("recipientIds", "name email role avatar designation")
        .lean();
    }

    // 3. Fetch Directory Context for composing broadcasts
    let teams: any[] = [];
    let users: any[] = [];

    if (role === "admin") {
      // Admin can target any manager's team or any user
      const managers = await User.find({ role: "manager", isActive: true })
        .select("_id name email avatar designation")
        .lean();

      // Count subordinates for each manager
      const managerTeams = await Promise.all(
        managers.map(async (m) => {
          const count = await User.countDocuments({
            managerId: m._id,
            isActive: true,
          });
          return {
            ...m,
            subordinateCount: count,
          };
        })
      );

      teams = managerTeams;

      users = await User.find({ isActive: true, _id: { $ne: userId } })
        .select("_id name email role avatar designation managerId")
        .sort({ name: 1 })
        .lean();
    } else if (role === "manager") {
      // Manager can target their own team or individual subordinates
      const subordinates = await User.find({
        managerId: userId,
        isActive: true,
      })
        .select("_id name email role avatar designation")
        .sort({ name: 1 })
        .lean();

      teams = [
        {
          _id: userId,
          name: "My Entire Team",
          subordinateCount: subordinates.length,
        },
      ];

      users = subordinates;
    }

    return {
      inbox,
      sent,
      teams,
      users,
    };
  }

  /**
   * Mark an interaction as read by a user
   */
  static async markAsRead(interactionId: string, userId: string) {
    await connectDB();
    const updated = await Interaction.findByIdAndUpdate(
      interactionId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
    return updated;
  }
}

export default InteractionService;
