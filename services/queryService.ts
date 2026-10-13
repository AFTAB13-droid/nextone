import connectDB from "@/lib/mongodb";
import Query from "@/models/Query";
import User from "@/models/User";
import NotificationService from "@/services/notificationService";
import { AuthSession, IQuery, QueryCategory, QueryStatus } from "@/lib/types";

export interface CreateQueryInput {
  title: string;
  description: string;
  category?: QueryCategory;
  priority?: "normal" | "urgent";
  attachments?: string[];
}

export class QueryService {
  static async createQuery(actor: AuthSession, input: CreateQueryInput): Promise<IQuery> {
    await connectDB();

    let assignedToId: string;

    if (actor.role === "employee") {
      // Find employee's assigned manager
      const employeeUser = await User.findById(actor.userId);
      if (employeeUser?.managerId) {
        assignedToId = employeeUser.managerId.toString();
      } else {
        // Fallback: assign to primary admin
        const adminUser = await User.findOne({ role: "admin", isActive: true });
        if (!adminUser) throw new Error("No admin available to receive query");
        assignedToId = adminUser._id.toString();
      }
    } else if (actor.role === "manager") {
      // Manager queries Admin
      const adminUser = await User.findOne({ role: "admin", isActive: true });
      if (!adminUser) throw new Error("No admin available to receive query");
      assignedToId = adminUser._id.toString();
    } else {
      // Admin creating a query note or assigned to self/team
      assignedToId = actor.userId;
    }

    const query = await Query.create({
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category || "clarification",
      priority: input.priority || "normal",
      raisedBy: actor.userId,
      assignedTo: assignedToId,
      status: "open",
      responses: [],
    });

    // Notify assigned manager or admin
    const targetLink =
      actor.role === "employee" ? "/manager/queries" : "/admin/queries";

    await NotificationService.createNotification(
      assignedToId,
      `New Query: ${input.title}`,
      `${actor.name} (${actor.role.toUpperCase()}) raised a query: "${input.title}"`,
      targetLink,
      "query"
    );

    const populated = await Query.findById(query._id)
      .populate("raisedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("escalatedTo", "name email role designation avatar")
      .lean();

    return populated as unknown as IQuery;
  }

  static async getQueries(
    actor: AuthSession,
    filter?: {
      status?: string;
      category?: string;
      priority?: string;
    }
  ): Promise<IQuery[]> {
    await connectDB();

    const query: Record<string, unknown> = {};

    if (actor.role === "admin") {
      // Admin sees all queries or queries assigned/escalated to them
      // No filter restriction: Admin has master visibility
    } else if (actor.role === "manager") {
      // Manager sees:
      // 1. Queries they raised to Admin
      // 2. Queries assigned to them by their employees
      query.$or = [{ raisedBy: actor.userId }, { assignedTo: actor.userId }];
    } else {
      // Employee sees only queries raised by them
      query.raisedBy = actor.userId;
    }

    if (filter?.status && filter.status !== "all") {
      query.status = filter.status;
    }
    if (filter?.category && filter.category !== "all") {
      query.category = filter.category;
    }
    if (filter?.priority && filter.priority !== "all") {
      query.priority = filter.priority;
    }

    const list = await Query.find(query)
      .populate("raisedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("escalatedTo", "name email role designation avatar")
      .sort({ updatedAt: -1 })
      .lean();

    return list as unknown as IQuery[];
  }

  static async getQueryById(queryId: string): Promise<IQuery | null> {
    await connectDB();

    const q = await Query.findById(queryId)
      .populate("raisedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("escalatedTo", "name email role designation avatar")
      .lean();

    return q as unknown as IQuery;
  }

  static async addResponse(
    actor: AuthSession,
    queryId: string,
    message: string,
    attachments?: string[]
  ): Promise<IQuery> {
    await connectDB();

    const queryDoc = await Query.findById(queryId)
      .populate("raisedBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!queryDoc) {
      throw new Error("Query not found");
    }

    queryDoc.responses.push({
      sender: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      message: message.trim(),
      attachments: attachments || [],
      createdAt: new Date(),
    });

    if (queryDoc.status === "open") {
      queryDoc.status = "in_progress";
    }

    await queryDoc.save();

    // Notify the other party
    const targetUserId =
      actor.userId === queryDoc.raisedBy._id.toString()
        ? queryDoc.assignedTo._id.toString()
        : queryDoc.raisedBy._id.toString();

    const targetLink =
      targetUserId === queryDoc.raisedBy._id.toString()
        ? queryDoc.raisedBy.role === "manager"
          ? "/manager/queries"
          : "/employee/queries"
        : "/manager/queries";

    await NotificationService.createNotification(
      targetUserId,
      `Response on Query: ${queryDoc.title}`,
      `${actor.name} replied to your query: "${message.slice(0, 50)}"`,
      targetLink,
      "query"
    );

    const updated = await Query.findById(queryId)
      .populate("raisedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("escalatedTo", "name email role designation avatar")
      .lean();

    return updated as unknown as IQuery;
  }

  static async escalateQuery(
    actor: AuthSession,
    queryId: string,
    escalationNote?: string
  ): Promise<IQuery> {
    await connectDB();

    const queryDoc = await Query.findById(queryId).populate("raisedBy", "name email role");
    if (!queryDoc) {
      throw new Error("Query not found");
    }

    // Find primary admin
    const adminUser = await User.findOne({ role: "admin", isActive: true });
    if (!adminUser) {
      throw new Error("No admin available to receive escalated query");
    }

    queryDoc.escalatedTo = adminUser._id as any;
    queryDoc.status = "in_progress";

    queryDoc.responses.push({
      sender: {
        _id: actor.userId as any,
        name: actor.name,
        role: actor.role,
      },
      message: `[ESCALATED TO ADMIN] ${escalationNote || "Escalated for administrative review and guidance."}`,
      attachments: [],
      createdAt: new Date(),
    });

    await queryDoc.save();

    // Notify Admin
    await NotificationService.createNotification(
      adminUser._id.toString(),
      "Query Escalated to Admin",
      `${actor.name} escalated query "${queryDoc.title}" to Admin.`,
      "/admin/queries",
      "query"
    );

    const updated = await Query.findById(queryId)
      .populate("raisedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("escalatedTo", "name email role designation avatar")
      .lean();

    return updated as unknown as IQuery;
  }

  static async updateStatus(
    actor: AuthSession,
    queryId: string,
    status: QueryStatus
  ): Promise<IQuery> {
    await connectDB();

    const queryDoc = await Query.findById(queryId).populate("raisedBy", "name email role");
    if (!queryDoc) {
      throw new Error("Query not found");
    }

    queryDoc.status = status;
    await queryDoc.save();

    // Notify query author
    await NotificationService.createNotification(
      queryDoc.raisedBy._id.toString(),
      `Query Marked ${status.toUpperCase()}`,
      `Your query "${queryDoc.title}" status has been updated to ${status.toUpperCase()} by ${actor.name}.`,
      queryDoc.raisedBy.role === "manager" ? "/manager/queries" : "/employee/queries",
      "query"
    );

    const updated = await Query.findById(queryId)
      .populate("raisedBy", "name email role designation avatar")
      .populate("assignedTo", "name email role designation avatar")
      .populate("escalatedTo", "name email role designation avatar")
      .lean();

    return updated as unknown as IQuery;
  }
}

export default QueryService;
