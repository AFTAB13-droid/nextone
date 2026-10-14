import connectDB from "@/lib/mongodb";
import Target from "@/models/Target";
import User from "@/models/User";
import NotificationService from "@/services/notificationService";
import { AuthSession, ITarget } from "@/lib/types";

export class TargetService {
  private static getTodayDateString(): string {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  static async getEmployeeTarget(employeeId: string, dateStr?: string): Promise<ITarget | null> {
    await connectDB();
    const targetDate = dateStr || this.getTodayDateString();

    const target = await Target.findOne({ employee: employeeId, date: targetDate })
      .populate("employee", "name email role designation department avatar")
      .lean();

    return target as unknown as ITarget;
  }

  static async saveTodayTarget(
    employeeId: string,
    targetText: string,
    progressNotes?: string,
    status?: "pending" | "in_progress" | "achieved" | "partially_achieved"
  ): Promise<ITarget> {
    await connectDB();
    const today = this.getTodayDateString();

    const updateDoc: Record<string, unknown> = {
      targetText: targetText.trim(),
      lastUpdatedTime: new Date(),
    };
    if (typeof progressNotes === "string") {
      updateDoc.progressNotes = progressNotes.trim();
    }
    if (status) {
      updateDoc.status = status;
    }

    const updated = await Target.findOneAndUpdate(
      { employee: employeeId, date: today },
      {
        $set: updateDoc,
        $setOnInsert: {
          employee: employeeId,
          date: today,
          comments: [],
          status: status || "in_progress",
        },
      },
      { upsert: true, new: true }
    )
      .populate("employee", "name email role designation department avatar")
      .lean();

    return updated as unknown as ITarget;
  }

  static async getTargetHistory(employeeId: string, limit: number = 30): Promise<ITarget[]> {
    await connectDB();
    const list = await Target.find({ employee: employeeId })
      .sort({ date: -1 })
      .limit(limit)
      .populate("employee", "name email role designation department avatar")
      .lean();

    return list as unknown as ITarget[];
  }

  static async getTargetsForDate(
    actor: AuthSession,
    dateStr?: string,
    filterManagerId?: string
  ): Promise<ITarget[]> {
    await connectDB();
    const queryDate = dateStr || this.getTodayDateString();

    let employeeIds: string[] = [];

    if (actor.role === "admin") {
      if (filterManagerId) {
        const subs = await User.find({ managerId: filterManagerId, isActive: true }).select("_id");
        employeeIds = subs.map((s) => s._id.toString());
      } else {
        const allEmployees = await User.find({ role: "employee", isActive: true }).select("_id");
        employeeIds = allEmployees.map((e) => e._id.toString());
      }
    } else if (actor.role === "manager") {
      const teamSubs = await User.find({ managerId: actor.userId, isActive: true }).select("_id");
      employeeIds = teamSubs.map((s) => s._id.toString());
    } else {
      employeeIds = [actor.userId];
    }

    const targets = await Target.find({
      employee: { $in: employeeIds },
      date: queryDate,
    })
      .populate("employee", "name email role designation department avatar managerId")
      .sort({ updatedAt: -1 })
      .lean();

    return targets as unknown as ITarget[];
  }

  static async addComment(
    actor: AuthSession,
    targetId: string,
    message: string
  ): Promise<ITarget> {
    await connectDB();

    const targetDoc = await Target.findById(targetId).populate("employee", "name email role managerId");
    if (!targetDoc) {
      throw new Error("Target record not found");
    }

    // Role check: Only employee themselves, their manager, or Admin can comment
    if (actor.role === "employee" && actor.userId !== targetDoc.employee._id.toString()) {
      throw new Error("Forbidden: You cannot comment on another employee's daily target");
    }

    targetDoc.comments.push({
      author: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      message: message.trim(),
      createdAt: new Date(),
    });

    await targetDoc.save();

    // If manager or admin commented, notify the employee
    if (actor.userId !== targetDoc.employee._id.toString()) {
      await NotificationService.createNotification(
        targetDoc.employee._id.toString(),
        "Feedback on Today's Target",
        `${actor.name} (${actor.role.toUpperCase()}) commented on your target for ${targetDoc.date}: "${message.slice(0, 40)}"`,
        "/employee/targets",
        "target"
      );
    }

    const updated = await Target.findById(targetId)
      .populate("employee", "name email role designation department avatar")
      .lean();

    return updated as unknown as ITarget;
  }
}

export default TargetService;
