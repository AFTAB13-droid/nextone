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
    let admin = await User.findOne({ email: { $in: ["admin@nexton.com", "admin@nextone.com"] } });
    const defaultPassword = await AuthService.hashPassword("Nexton@2025");

    if (!admin) {
      admin = await User.create({
        name: "Vikram Malhotra",
        email: "admin@nexton.com",
        password: defaultPassword,
        role: "admin",
        department: "Executive Management",
        designation: "Managing Director",
        phone: "+91 98200 12345",
        avatar: "/avatars/man-2.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    } else {
      admin.name = "Vikram Malhotra";
      admin.email = "admin@nexton.com";
      admin.designation = "Managing Director";
      admin.phone = "+91 98200 12345";
      admin.password = defaultPassword;
      await admin.save();
    }

    // Create Managers
    let manager1 = await User.findOne({ email: { $in: ["priya.sharma@nexton.com", "sarah.lead@nexton.com", "sarah.lead@nextone.com"] } });
    if (!manager1) {
      manager1 = await User.create({
        name: "Priya Sharma",
        email: "priya.sharma@nexton.com",
        password: defaultPassword,
        role: "manager",
        department: "Operations & Delivery",
        designation: "Senior Operations Lead",
        phone: "+91 98200 23456",
        avatar: "/avatars/woman-1.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    } else {
      manager1.name = "Priya Sharma";
      manager1.email = "priya.sharma@nexton.com";
      manager1.department = "Operations & Delivery";
      manager1.designation = "Senior Operations Lead";
      manager1.phone = "+91 98200 23456";
      manager1.password = defaultPassword;
      await manager1.save();
    }

    let manager2 = await User.findOne({ email: { $in: ["rahul.verma@nexton.com", "david.lead@nexton.com", "david.lead@nextone.com"] } });
    if (!manager2) {
      manager2 = await User.create({
        name: "Rahul Verma",
        email: "rahul.verma@nexton.com",
        password: defaultPassword,
        role: "manager",
        department: "Accounts & Business",
        designation: "Accounts & Business Head",
        phone: "+91 98200 34567",
        avatar: "/avatars/man-2.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    } else {
      manager2.name = "Rahul Verma";
      manager2.email = "rahul.verma@nexton.com";
      manager2.department = "Accounts & Business";
      manager2.designation = "Accounts & Business Head";
      manager2.phone = "+91 98200 34567";
      manager2.password = defaultPassword;
      await manager2.save();
    }

    // Create Employees
    let emp1 = await User.findOne({ email: { $in: ["aarav.patel@nexton.com", "alex.dev@nexton.com", "alex.dev@nextone.com"] } });
    if (!emp1) {
      emp1 = await User.create({
        name: "Aarav Patel",
        email: "aarav.patel@nexton.com",
        password: defaultPassword,
        role: "employee",
        managerId: manager1._id,
        department: "Operations & Delivery",
        designation: "Operations Executive",
        phone: "+91 98200 45678",
        avatar: "/avatars/man-1.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    } else {
      emp1.name = "Aarav Patel";
      emp1.email = "aarav.patel@nexton.com";
      emp1.department = "Operations & Delivery";
      emp1.designation = "Operations Executive";
      emp1.managerId = manager1._id;
      emp1.phone = "+91 98200 45678";
      emp1.password = defaultPassword;
      await emp1.save();
    }

    let emp2 = await User.findOne({ email: { $in: ["neha.gupta@nexton.com", "emily.design@nexton.com", "emily.design@nextone.com"] } });
    if (!emp2) {
      emp2 = await User.create({
        name: "Neha Gupta",
        email: "neha.gupta@nexton.com",
        password: defaultPassword,
        role: "employee",
        managerId: manager1._id,
        department: "Marketing & Design",
        designation: "Design & Brand Specialist",
        phone: "+91 98200 56789",
        avatar: "/avatars/woman-2.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    } else {
      emp2.name = "Neha Gupta";
      emp2.email = "neha.gupta@nexton.com";
      emp2.department = "Marketing & Design";
      emp2.designation = "Design & Brand Specialist";
      emp2.managerId = manager1._id;
      emp2.phone = "+91 98200 56789";
      emp2.password = defaultPassword;
      await emp2.save();
    }

    let emp3 = await User.findOne({ email: { $in: ["rohan.mehta@nexton.com", "marcus.growth@nexton.com", "marcus.growth@nextone.com"] } });
    if (!emp3) {
      emp3 = await User.create({
        name: "Rohan Mehta",
        email: "rohan.mehta@nexton.com",
        password: defaultPassword,
        role: "employee",
        managerId: manager2._id,
        department: "Accounts & Business",
        designation: "Business Development Associate",
        phone: "+91 98200 67890",
        avatar: "/avatars/man-3.svg",
        isActive: true,
        firstLoginCompleted: true,
      });
    } else {
      emp3.name = "Rohan Mehta";
      emp3.email = "rohan.mehta@nexton.com";
      emp3.department = "Accounts & Business";
      emp3.designation = "Business Development Associate";
      emp3.managerId = manager2._id;
      emp3.phone = "+91 98200 67890";
      emp3.password = defaultPassword;
      await emp3.save();
    }

    // Sample Tasks if empty
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      // 1. Admin assigns to Manager Priya
      await Task.create({
        title: "Monthly Client GST Filing & Invoice Reconciliation",
        description: "Reconcile GSTR-1 and GSTR-3B with client sales registers, verify input tax credit with suppliers, and finalize accounts sign-off.",
        assignedBy: admin._id,
        assignedTo: manager1._id,
        priority: "urgent",
        status: "in_progress",
        dueDate: new Date(Date.now() + 86400000 * 5),
        progressPercentage: 55,
        tags: ["Finance", "GST", "Accounts"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: admin._id, name: admin.name, role: "admin" },
            note: "Assigned monthly tax and invoicing reconciliation to Priya Sharma.",
            timestamp: new Date(Date.now() - 86400000 * 2),
          },
          {
            action: "Status changed: PENDING → IN_PROGRESS",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Reconciling sales invoices against vendor portal ledgers.",
            timestamp: new Date(Date.now() - 86400000),
          },
        ],
        comments: [
          {
            author: { _id: admin._id, name: admin.name, role: "admin" },
            message: "Please ensure all client e-way bills and credit notes are audited before month-end.",
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
        ],
      });

      // 2. Manager Priya assigns to Employee Aarav (In Review)
      await Task.create({
        title: "Prepare Corporate Presentation & Client Onboarding Kit",
        description: "Draft company welcome portfolio, standardize service agreement templates, and compile onboarding checklist for upcoming corporate client visits.",
        assignedBy: manager1._id,
        assignedTo: emp1._id,
        managerInCharge: manager1._id,
        priority: "high",
        status: "in_review",
        dueDate: new Date(Date.now() + 86400000 * 2),
        progressPercentage: 85,
        tags: ["Operations", "ClientRelations", "Documentation"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Assigned to Aarav Patel.",
            timestamp: new Date(Date.now() - 86400000 * 3),
          },
          {
            action: "Status changed: IN_PROGRESS → IN_REVIEW",
            by: { _id: emp1._id, name: emp1.name, role: "employee" },
            note: "Completed initial draft deck and client checklist. Ready for managerial review.",
            timestamp: new Date(Date.now() - 3600000 * 4),
          },
        ],
        comments: [
          {
            author: { _id: emp1._id, name: emp1.name, role: "employee" },
            message: "Deck updated with service scope and executive summary. Shared for your review!",
            createdAt: new Date(Date.now() - 3600000 * 4),
          },
        ],
      });

      // 3. Manager Priya assigns to Employee Neha (Completed)
      await Task.create({
        title: "Design Festival Campaign Creatives & Client Greetings",
        description: "Create branded social media banners, customized festive client greeting cards, and digital catalog assets for upcoming holiday season.",
        assignedBy: manager1._id,
        assignedTo: emp2._id,
        managerInCharge: manager1._id,
        priority: "medium",
        status: "completed",
        dueDate: new Date(Date.now() - 86400000),
        progressPercentage: 100,
        tags: ["Marketing", "Creative", "Branding"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Assigned to Neha Gupta.",
            timestamp: new Date(Date.now() - 86400000 * 5),
          },
          {
            action: "Status changed: IN_REVIEW → COMPLETED",
            by: { _id: manager1._id, name: manager1.name, role: "manager" },
            note: "Approved! Beautiful festive designs and clean typography.",
            timestamp: new Date(Date.now() - 86400000),
          },
        ],
      });

      // 4. Manager Rahul assigns to Employee Rohan (Pending)
      await Task.create({
        title: "Follow up with Mumbai Corporate Accounts for Contract Renewals",
        description: "Contact designated relationship managers, review active annual maintenance contracts, and issue renewed service quotation proposals.",
        assignedBy: manager2._id,
        assignedTo: emp3._id,
        managerInCharge: manager2._id,
        priority: "medium",
        status: "pending",
        dueDate: new Date(Date.now() + 86400000 * 7),
        progressPercentage: 0,
        tags: ["Sales", "Accounts", "Corporate"],
        activityLogs: [
          {
            action: "Task Created",
            by: { _id: manager2._id, name: manager2.name, role: "manager" },
            note: "Assigned to Rohan Mehta.",
            timestamp: new Date(),
          },
        ],
      });
    }

    // Sample Queries if empty
    const queryCount = await Query.countDocuments();
    if (queryCount === 0) {
      // Aarav querying Priya
      await Query.create({
        title: "Clarification on Client Payment Terms for Apex Enterprises",
        description: "Client is requesting a 45-day credit cycle instead of our standard 30-day payment term for their annual maintenance order. Can we approve this waiver?",
        category: "operations",
        priority: "urgent",
        raisedBy: emp1._id,
        assignedTo: manager1._id,
        status: "in_progress",
        responses: [
          {
            sender: { _id: manager1._id, name: manager1.name, role: "manager" },
            message: "I checked their previous payment track record; they have been consistent. We can approve 45 days for this cycle.",
            createdAt: new Date(Date.now() - 3600000 * 2),
          },
        ],
      });

      // Priya escalating to Admin Vikram
      await Query.create({
        title: "Discrepancy in Vendor Transport Invoice - Delhi Branch",
        description: "Courier partner has charged ₹4,200 extra on shipment consignment #882. Requesting admin verification before releasing vendor payment.",
        category: "resource",
        priority: "urgent",
        raisedBy: manager1._id,
        assignedTo: admin._id,
        escalatedTo: admin._id,
        status: "open",
        responses: [
          {
            sender: { _id: manager1._id, name: manager1.name, role: "manager" },
            message: "[ESCALATED TO ADMIN] Escalated for billing review and authorization.",
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
        message: "Nexton Enterprise Portal has been successfully initialized.",
        link: "/admin",
        type: "system",
        isRead: false,
      });
      await Notification.create({
        recipient: manager1._id,
        title: "New Task Assigned",
        message: "Vikram Malhotra assigned you: Monthly Client GST Filing & Invoice Reconciliation",
        link: "/manager/tasks",
        type: "task",
        isRead: false,
      });
      await Notification.create({
        recipient: emp1._id,
        title: "Task Assigned",
        message: "Priya Sharma assigned you: Prepare Corporate Presentation & Client Onboarding Kit",
        link: "/employee/tasks",
        type: "task",
        isRead: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with Indian demo users, hierarchy, tasks, and queries!",
      credentials: [
        { role: "admin", email: "admin@nexton.com", name: "Vikram Malhotra", pass: "Nexton@2025" },
        { role: "manager", email: "priya.sharma@nexton.com", name: "Priya Sharma", pass: "Nexton@2025" },
        { role: "employee", email: "aarav.patel@nexton.com", name: "Aarav Patel", pass: "Nexton@2025" },
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
