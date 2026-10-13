import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import NotificationService from "@/services/notificationService";
import { AuthSession, ITask, TaskPriority, TaskStatus } from "@/lib/types";

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedTo: string;
  priority?: TaskPriority;
  dueDate: string | Date;
  tags?: string[];
  attachments?: string[];
}

export class TaskService {
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

    const task = await Task.create({
      title: input.title.trim(),
      description: input.description || "",
      assignedBy: actor.userId,
      assignedTo: input.assignedTo,
      managerInCharge: assignee.managerId || (actor.role === "manager" ? actor.userId : null),
      priority: input.priority || "medium",
      status: "pending",
      dueDate: new Date(input.dueDate),
      progressPercentage: 0,
      tags: input.tags || [],
      attachments: input.attachments || [],
      activityLogs: [
        {
          action: "Task Created",
          by: {
            _id: actor.userId,
            name: actor.name,
            role: actor.role,
          },
          note: `Assigned to ${assignee.name} by ${actor.name}`,
          timestamp: new Date(),
        },
      ],
      comments: [],
    });

    // In-app notification to assignee
    const dashboardLink = assignee.role === "manager" ? "/manager/tasks" : "/employee/tasks";
    await NotificationService.createNotification(
      input.assignedTo,
      "New Task Assigned",
      `"${task.title}" was assigned to you by ${actor.name} (${actor.role.toUpperCase()}). Due: ${new Date(task.dueDate).toLocaleDateString()}`,
      dashboardLink,
      "task"
    );

    const populated = await Task.findById(task._id)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
      .lean();

    return populated as unknown as ITask;
  }

  static async getTasks(
    actor: AuthSession,
    filter?: {
      status?: string;
      priority?: string;
      assignedTo?: string;
      assignedBy?: string;
      search?: string;
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
      const subordinates = await User.find({ managerId: actor.userId }).select("_id");
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

    if (filter?.search) {
      query.title = { $regex: filter.search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
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
      note: note || `Updated by ${actor.name}`,
      timestamp: new Date(),
    });

    await task.save();

    // Trigger lifecycle notifications
    const targetUserId =
      actor.userId === task.assignedTo._id.toString()
        ? task.assignedBy._id.toString()
        : task.assignedTo._id.toString();

    let notifTitle = `Task Status: ${newStatus.toUpperCase()}`;
    let notifMessage = `${actor.name} moved "${task.title}" to ${newStatus.replace("_", " ").toUpperCase()}`;

    if (newStatus === "in_review") {
      notifTitle = "Task Submitted for Review";
      notifMessage = `${actor.name} submitted "${task.title}" for your approval/review.`;
    } else if (newStatus === "completed") {
      notifTitle = "Task Completed & Approved";
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
      "New Comment on Task",
      `${actor.name} commented on "${task.title}": "${message.slice(0, 50)}"`,
      actor.role === "employee" ? "/manager/tasks" : "/employee/tasks",
      "task"
    );

    const updated = await Task.findById(taskId)
      .populate("assignedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("managerInCharge", "name email role designation avatar")
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
    pending: number;
    in_progress: number;
    in_review: number;
    completed: number;
    blocked: number;
    overdue: number;
    completionRate: number;
  }> {
    await connectDB();

    const allTasks = await this.getTasks(actor);

    const now = new Date();
    let pending = 0;
    let in_progress = 0;
    let in_review = 0;
    let completed = 0;
    let blocked = 0;
    let overdue = 0;

    for (const t of allTasks) {
      if (t.status === "pending") pending++;
      else if (t.status === "in_progress") in_progress++;
      else if (t.status === "in_review") in_review++;
      else if (t.status === "completed") completed++;
      else if (t.status === "blocked") blocked++;

      if (t.status !== "completed" && new Date(t.dueDate) < now) {
        overdue++;
      }
    }

    const total = allTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      in_progress,
      in_review,
      completed,
      blocked,
      overdue,
      completionRate,
    };
  }
}

export default TaskService;
