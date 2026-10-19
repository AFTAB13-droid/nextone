import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import Query from "@/models/Query";
import Notification from "@/models/Notification";
import AuthService from "@/services/authService";

export async function POST() {
  try {
    await connectDB();

    // Check if admin already exists
    let admin = await User.findOne({ email: "admin@nextone.com" });
    const defaultPassword = await AuthService.hashPassword("NextOne@2025");

    if (!admin) {
      admin = await User.create({
        name: "NextOne Executive Admin",
        email: "admin@nextone.com",
        password: defaultPassword,
        role: "admin",
        department: "Executive Management",
        designation: "Chief Operations Officer",
        phone: "+1 800-555-0199",
        avatar: "/avatars/man-2.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    }

    // Create Managers
    let manager1 = await User.findOne({ email: "sarah.lead@nextone.com" });
    if (!manager1) {
      manager1 = await User.create({
        name: "Sarah Jenkins",
        email: "sarah.lead@nextone.com",
        password: defaultPassword,
        role: "manager",
        department: "Engineering & Tech",
        designation: "Principal Tech Lead",
        phone: "+1 800-555-0101",
        avatar: "/avatars/woman-1.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    }

    let manager2 = await User.findOne({ email: "david.lead@nextone.com" });
    if (!manager2) {
      manager2 = await User.create({
        name: "David Miller",
        email: "david.lead@nextone.com",
        password: defaultPassword,
        role: "manager",
        department: "Product & Growth",
        designation: "Product Director",
        phone: "+1 800-555-0102",
        avatar: "/avatars/man-2.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    }

    // Create Employees
    let emp1 = await User.findOne({ email: "alex.dev@nextone.com" });
    if (!emp1) {
      emp1 = await User.create({
        name: "Alex Rivera",
        email: "alex.dev@nextone.com",
        password: defaultPassword,
        role: "employee",
        managerId: manager1._id,
        department: "Engineering & Tech",
        designation: "Senior Frontend Engineer",
        phone: "+1 800-555-0201",
        avatar: "/avatars/man-1.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    }

    let emp2 = await User.findOne({ email: "emily.design@nextone.com" });
    if (!emp2) {
      emp2 = await User.create({
        name: "Emily Chen",
        email: "emily.design@nextone.com",
        password: defaultPassword,
        role: "employee",
        managerId: manager1._id,
        department: "Engineering & Tech",
        designation: "UI/UX Product Designer",
        phone: "+1 800-555-0202",
        avatar: "/avatars/woman-2.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    }

    let emp3 = await User.findOne({ email: "marcus.growth@nextone.com" });
    if (!emp3) {
      emp3 = await User.create({
        name: "Marcus Vance",
        email: "marcus.growth@nextone.com",
        password: defaultPassword,
        role: "employee",
        managerId: manager2._id,
        department: "Product & Growth",
        designation: "Growth Marketing Specialist",
        phone: "+1 800-555-0203",
        avatar: "/avatars/man-3.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    }

    // Sample Tasks if empty
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      // 1. Admin assigns to Manager Sarah
      await Task.create({
        title: "Q4 Infrastructure Security Audit & Cloud Migration",
        description: "Review current cloud microservices architecture, conduct vulnerability assessments, and prepare staging migration plan.",
        assignedBy: admin._id,
        assignedTo: manager1._id,
        priority: "urgent",
        status: "in_progress",
        dueDate: new Date(Date.now() + 86400000 * 5),
        progressPercentage: 45,
        tags: ["Infrastructure", "Security", "Cloud"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: admin._id, name: admin.name, role: "admin" },
            note: "Assigned high-priority cloud migration to Tech Lead Sarah.",
            timestamp: new Date(Date.now() - 86400000 * 2),
          },
          {
            action: "Status changed: PENDING → IN_PROGRESS",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Auditing current VPC topology and load balancers.",
            timestamp: new Date(Date.now() - 86400000),
          },
        ],
        comments: [
          {
            author: { _id: admin._id, name: admin.name, role: "admin" },
            message: "Please ensure zero-downtime failover is tested before migration.",
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
        ],
      });

      // 2. Manager Sarah assigns to Employee Alex (In Review)
      await Task.create({
        title: "Implement Realtime Role-Based Dashboard & Analytics UI",
        description: "Build clean KPI metric cards, task status breakdown charts, and responsive sidebar navigation according to design specs.",
        assignedBy: manager1._id,
        assignedTo: emp1._id,
        managerInCharge: manager1._id,
        priority: "high",
        status: "in_review",
        dueDate: new Date(Date.now() + 86400000 * 2),
        progressPercentage: 90,
        tags: ["Frontend", "React", "Dashboard"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Assigned to Alex Rivera.",
            timestamp: new Date(Date.now() - 86400000 * 3),
          },
          {
            action: "Status changed: IN_PROGRESS → IN_REVIEW",
            by: { _id: emp1._id, name: emp1.name, role: "employee" },
            note: "Finished frontend components and hooked up API. Ready for code review.",
            timestamp: new Date(Date.now() - 3600000 * 4),
          },
        ],
        comments: [
          {
            author: { _id: emp1._id, name: emp1.name, role: "employee" },
            message: "All views have been tested across desktop and mobile. Ready for review!",
            createdAt: new Date(Date.now() - 3600000 * 4),
          },
        ],
      });

      // 3. Manager Sarah assigns to Employee Emily (Completed)
      await Task.create({
        title: "Design System & Figma Component Tokens for NextOne 2.0",
        description: "Create standard color tokens, button states, modal designs, and interactive task cards in Figma.",
        assignedBy: manager1._id,
        assignedTo: emp2._id,
        managerInCharge: manager1._id,
        priority: "medium",
        status: "completed",
        dueDate: new Date(Date.now() - 86400000),
        progressPercentage: 100,
        tags: ["UI/UX", "Design", "Figma"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Assigned to Emily Chen.",
            timestamp: new Date(Date.now() - 86400000 * 5),
          },
          {
            action: "Status changed: IN_REVIEW → COMPLETED",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Approved! Great job on design consistency.",
            timestamp: new Date(Date.now() - 86400000),
          },
        ],
      });

      // 4. Manager David assigns to Employee Marcus (Pending)
      await Task.create({
        title: "Launch Enterprise Client Outreach Sequence",
        description: "Draft 5 personalized communication templates and configure automated follow-up sequences for prospective accounts.",
        assignedBy: manager2._id,
        assignedTo: emp3._id,
        managerInCharge: manager2._id,
        priority: "medium",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 7),
        progressPercentage: 0,
        tags: ["Marketing", "Outreach", "Clients"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: manager2._id, name: manager2.name, role: "manager" },
            note: "Assigned to Marcus Vance.",
            timestamp: new Date(),
          },
        ],
      });
    }

    // Sample Queries if empty
    const queryCount = await Query.countDocuments();
    if (queryCount === 0) {
      // Alex querying Sarah
      await Query.create({
        title: "Database connection timeout during peak stress test",
        description: "During heavy mock stress tests, connection pool exhausted under 50 concurrent requests. Should we enable auto-scaling pool in staging?",
        category: "technical",
        priority: "urgent",
        raisedBy: emp1._id,
        assignedTo: manager1._id,
        status: "in_progress",
        responses: [
          {
            sender: { _id: manager1._id, name: manager1.name, role: "manager" },
            message: "I checked the Mongoose connection options. Let's raise maxPoolSize to 100 and add serverSelectionTimeoutMS.",
            createdAt: new Date(Date.now() - 3600000 * 2),
          },
        ],
      });

      // Sarah escalating to Admin
      await Query.create({
        title: "Cloud Infrastructure Budget Increase for Dedicated Redis Cluster",
        description: "Our current cache server is nearing 85% memory utilization. Requesting admin approval to upgrade cluster tier.",
        category: "resource",
        priority: "urgent",
        raisedBy: manager1._id,
        assignedTo: admin._id,
        escalatedTo: admin._id,
        status: "open",
        responses: [
          {
            sender: { _id: manager1._id, name: manager1.name, role: "manager" },
            message: "[ESCALATED TO ADMIN] Escalated for budget authorization.",
            createdAt: new Date(),
          },
        ],
      });
    }

    // Sample notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      await Notification.create({
        recipient: admin._id,
        title: "System Initialized",
        message: "NextOne Enterprise Portal has been successfully initialized.",
        link: "/admin",
        type: "system",
        isRead: false,
      });
      await Notification.create({
        recipient: manager1._id,
        title: "New Task Assigned",
        message: "Admin assigned you: Q4 Infrastructure Security Audit & Cloud Migration",
        link: "/manager/tasks",
        type: "task",
        isRead: false,
      });
      await Notification.create({
        recipient: emp1._id,
        title: "Task Assigned",
        message: "Sarah Jenkins assigned you: Implement Realtime Role-Based Dashboard",
        link: "/employee/tasks",
        type: "task",
        isRead: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with demo users, hierarchy, tasks, and queries!",
      credentials: [
        { role: "admin", email: "admin@nextone.com", pass: "NextOne@2025" },
        { role: "manager", email: "sarah.lead@nextone.com", pass: "NextOne@2025" },
        { role: "employee", email: "alex.dev@nextone.com", pass: "NextOne@2025" },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error seeding database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
