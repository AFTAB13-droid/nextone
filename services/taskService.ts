import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import NotificationService from "@/services/notificationService";
import EmailService from "@/services/emailService";
import { AuthSession, ITask, TaskPriority, TaskStatus } from "@/lib/types";

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo: string;
  priority?: TaskPriority;
  dueDate: string | Date;
  tags?: string[];
  attachments?: string[];
  parentTaskId?: string;
}

export class TaskService {
  private static async generateTaskId(): Promise<string> {
    const count = await Task.countDocuments();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `TSK-${1000 + count + 1}`;
  }

  static async createTask(actor: AuthSession, input: CreateTaskInput): Promise<ITask> {
    await connectDB();

    const assignee = await User.findById(input.assignedTo);
    if (!assignee) {
      throw new Error("Assignee user not found");
    }

    // Role-based assignment validation:
    // If actor is Manager, ensure assignee is either themselves or one of their subordinate employees
    if (actor.role === "manager") {
      const isSelf = assignee._id.toString() === actor.userId;
      const isSubordinate = assignee.managerId?.toString() === actor.userId;
      if (!isSelf && !isSubordinate) {
        throw new Error("Managers can only assign tasks to employees assigned to their team.");
      }
    } else if (actor.role === "employee") {
      throw new Error("Employees cannot create or assign tasks.");
    }

    const taskIdFormatted = await this.generateTaskId();

    const task = await Task.create({
      taskId: taskIdFormatted,
      title: input.title.trim(),
      description: input.description || "",
      assignedBy: actor.userId,
      assignedTo: input.assignedTo,
      managerInCharge: assignee.managerId || (actor.role === "manager" ? actor.userId : null),
      parentTaskId: input.parentTaskId || null,
      priority: input.priority || "medium",
      status: "assigned",
      dueDate: new Date(input.dueDate),
      progressPercentage: 0,
      tags: input.tags || [],
      attachments: input.attachments || [],
      activityLogs: [
        {
          action: "Task Created",
          by: {
            _id: actor.userId as any,
            name: actor.name,
            role: actor.role,
          },
          note: `Assigned to ${assignee.name} by ${actor.name} (${taskIdFormatted})`,
          timestamp: new Date(),
        },
      ],
      comments: [],
    });

    // In-app notification to assignee
    const dashboardLink = assignee.role === "manager" ? "/manager/tasks" : "/employee/tasks";
    await NotificationService.createNotification(
      input.assignedTo,
      `New Task Assigned [${taskIdFormatted}]`,
      `"${task.title}" was assigned to you by ${actor.name} (${actor.role.toUpperCase()}). Due: ${new Date(task.dueDate).toLocaleDateString()}`,
      dashboardLink,
      "task"
    );

    // Email notification (Section 9: non-blocking)
    EmailService.sendNotificationEmail({
      to: assignee.email,
      subject: `[Nexton] New Task Assigned: ${task.title} (${taskIdFormatted})`,
      htmlContent: `<p>Hello ${assignee.name},</p><p>${actor.name} has assigned you task <strong>${task.title}</strong> (${taskIdFormatted}).</p>`,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
      .populate("parentTaskId", "taskId title status")
      .lean();

    return populated as unknown as ITask;
  }

  // Section 4.A: Manager splits Admin-assigned task into subordinate tasks
  static async splitTask(
    actor: AuthSession,
    parentTaskId: string,
    subtaskInput: CreateTaskInput
  ): Promise<ITask> {
    await connectDB();

    const parentTask = await Task.findById(parentTaskId);
    if (!parentTask) {
      throw new Error("Parent task not found");
    }

    if (actor.role === "manager" && parentTask.assignedTo.toString() !== actor.userId) {
      throw new Error("You can only split tasks assigned directly to you by Admin");
    }

    // Append activity log to parent task
    parentTask.activityLogs.push({
      action: "Work Distributed / Split",
      by: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      note: `Manager split this initiative and delegated work: "${subtaskInput.title}"`,
      timestamp: new Date(),
    });
    await parentTask.save();

    // Create subtask linked to parent
    return this.createTask(actor, {
      ...subtaskInput,
      parentTaskId,
    });
  }

  static async getTasks(
    actor: AuthSession,
    filter?: {
      status?: string;
      priority?: string;
      assignedTo?: string;
      assignedBy?: string;
      search?: string;
      parentTaskId?: string;
    }
  ): Promise<ITask[]> {
    await connectDB();

    const query: Record<string, unknown> = {};

    // RBAC filtering
    if (actor.role === "admin") {
      // Admin sees everything across company
      if (filter?.assignedTo) query.assignedTo = filter.assignedTo;
      if (filter?.assignedBy) query.assignedBy = filter.assignedBy;
    } else if (actor.role === "manager") {
      // Find employees reporting to this manager
      const subordinates = await User.find({ managerId: actor.userId }).select("_id").lean();
      const subordinateIds = subordinates.map((s) => s._id);

      // Manager sees: tasks assigned TO this manager OR tasks assigned BY this manager OR tasks belonging to their subordinates
      query.$or = [
        { assignedTo: actor.userId },
        { assignedBy: actor.userId },
        { assignedTo: { $in: subordinateIds } },
        { managerInCharge: actor.userId },
      ];
    } else {
      // Employee sees only their own tasks
      query.assignedTo = actor.userId;
    }

    if (filter?.status && filter.status !== "all") {
      query.status = filter.status;
    }

    if (filter?.priority && filter.priority !== "all") {
      query.priority = filter.priority;
    }

    if (filter?.parentTaskId) {
      query.parentTaskId = filter.parentTaskId;
    }

    if (filter?.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: "i" } },
        { taskId: { $regex: filter.search, $options: "i" } },
        { description: { $regex: filter.search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
      .populate("parentTaskId", "taskId title status")
      .sort({ createdAt: -1 })
      .lean();

    return tasks as unknown as ITask[];
  }

  static async getTaskById(taskId: string): Promise<ITask | null> {
    await connectDB();

    const task = await Task.findById(taskId)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
      .populate("parentTaskId", "taskId title status")
      .lean();

    return task as unknown as ITask;
  }

  static async updateTaskLifecycle(
    actor: AuthSession,
    taskId: string,
    newStatus: TaskStatus,
    note?: string,
    progressPercentage?: number
  ): Promise<ITask> {
    await connectDB();

    const task = await Task.findById(taskId)
      .populate("assignedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!task) {
      throw new Error("Task not found");
    }

    const previousStatus = task.status;
    task.status = newStatus;

    if (typeof progressPercentage === "number") {
      task.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
    } else if (newStatus === "completed") {
      task.progressPercentage = 100;
      task.completionDate = new Date();
    } else if (newStatus === "in_review" && task.progressPercentage < 80) {
      task.progressPercentage = 90;
    }

    // Append to activity logs
    task.activityLogs.push({
      action: `Status changed: ${previousStatus.toUpperCase()} → ${newStatus.toUpperCase()}`,
      by: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      note: note || `Status updated by ${actor.name}`,
      timestamp: new Date(),
    });

    await task.save();

    // Trigger lifecycle notifications
    const targetUserId =
      actor.userId === task.assignedTo._id.toString()
        ? task.assignedBy._id.toString()
        : task.assignedTo._id.toString();

    let notifTitle = `Task Status: ${newStatus.toUpperCase()} [${task.taskId || ""}]`;
    let notifMessage = `${actor.name} moved "${task.title}" to ${newStatus.replace("_", " ").toUpperCase()}`;

    if (newStatus === "in_review") {
      notifTitle = `Task Submitted for Review [${task.taskId || ""}]`;
      notifMessage = `${actor.name} submitted "${task.title}" for your approval/review.`;
    } else if (newStatus === "completed") {
      notifTitle = `Task Completed & Approved [${task.taskId || ""}]`;
      notifMessage = `"${task.title}" has been marked as COMPLETED.`;
    }

    await NotificationService.createNotification(
      targetUserId,
      notifTitle,
      notifMessage,
      actor.role === "employee" ? "/manager/tasks" : "/employee/tasks",
      "task"
    );

    const updated = await Task.findById(taskId)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
      .populate("parentTaskId", "taskId title status")
      .lean();

    return updated as unknown as ITask;
  }

  static async addTaskComment(
    actor: AuthSession,
    taskId: string,
    message: string,
    attachments?: string[]
  ): Promise<ITask> {
    await connectDB();

    const task = await Task.findById(taskId)
      .populate("assignedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!task) {
      throw new Error("Task not found");
    }

    task.comments.push({
      author: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      message: message.trim(),
      attachments: attachments || [],
      createdAt: new Date(),
    });

    task.activityLogs.push({
      action: "Comment Added",
      by: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      note: `Added comment: "${message.slice(0, 40)}${message.length > 40 ? "..." : ""}"`,
      timestamp: new Date(),
    });

    await task.save();

    // Notify other party
    const recipientId =
      actor.userId === task.assignedTo._id.toString()
        ? task.assignedBy._id.toString()
        : task.assignedTo._id.toString();

    await NotificationService.createNotification(
      recipientId,
      `New Comment on Task [${task.taskId || ""}]`,
      `${actor.name} commented on "${task.title}": "${message.slice(0, 50)}"`,
      actor.role === "employee" ? "/manager/tasks" : "/employee/tasks",
      "task"
    );

    const updated = await Task.findById(taskId)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
      .populate("parentTaskId", "taskId title status")
      .lean();

    return updated as unknown as ITask;
  }

  static async deleteTask(actor: AuthSession, taskId: string): Promise<boolean> {
    await connectDB();

    const task = await Task.findById(taskId);
    if (!task) return false;

    // Only Admin or Assigner can delete
    if (actor.role !== "admin" && task.assignedBy.toString() !== actor.userId) {
      throw new Error("Not authorized to delete this task");
    }

    await Task.findByIdAndDelete(taskId);
    return true;
  }

  static async getTaskMetrics(actor: AuthSession): Promise<{
    total: number;
    assigned: number;
    in_progress: number;
    on_hold: number;
    in_review: number;
    completed: number;
    cancelled: number;
    overdue: number;
    completionRate: number;
  }> {
    await connectDB();

    const allTasks = await this.getTasks(actor);

    const now = new Date();
    let assigned = 0;
    let in_progress = 0;
    let on_hold = 0;
    let in_review = 0;
    let completed = 0;
    let cancelled = 0;
    let overdue = 0;

    for (const t of allTasks) {
      if (t.status === "assigned" || t.status === "pending") assigned++;
      else if (t.status === "in_progress") in_progress++;
      else if (t.status === "on_hold" || t.status === "blocked") on_hold++;
      else if (t.status === "in_review") in_review++;
      else if (t.status === "completed") completed++;
      else if (t.status === "cancelled") cancelled++;

      if (t.status !== "completed" && t.status !== "cancelled" && new Date(t.dueDate) < now) {
        overdue++;
      }
    }

    const total = allTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      assigned,
      in_progress,
      on_hold,
      in_review,
      completed,
      cancelled,
      overdue,
      completionRate,
    };
  }
}

export default TaskService;
