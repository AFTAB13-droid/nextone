import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://NEXTONE:Next678@nextone.1frrsde.mongodb.net/nextone?retryWrites=true&w=majority";

async function migrate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const users = db.collection("users");
  const tasks = db.collection("tasks");
  const queries = db.collection("queries");

  const admin = await users.findOne({ email: "admin@nexton.com" });
  const priya = await users.findOne({ email: "priya.sharma@nexton.com" });
  const rahul = await users.findOne({ email: "rahul.verma@nexton.com" });
  const aarav = await users.findOne({ email: "aarav.patel@nexton.com" });
  const neha = await users.findOne({ email: "neha.gupta@nexton.com" });
  const rohan = await users.findOne({ email: "rohan.mehta@nexton.com" });

  console.log("Found users:", {
    admin: admin?._id,
    priya: priya?._id,
    rahul: rahul?._id,
    aarav: aarav?._id,
    neha: neha?._id,
    rohan: rohan?._id,
  });

  // Clear existing old tech tasks and re-insert fresh relatable Indian business tasks
  await tasks.deleteMany({});
  console.log("Cleared old tasks.");

  await tasks.insertMany([
    {
      title: "Monthly Client GST Filing & Invoice Reconciliation",
      description: "Reconcile GSTR-1 and GSTR-3B with client sales registers, verify input tax credit with suppliers, and finalize accounts sign-off.",
      assignedBy: admin?._id,
      assignedTo: priya?._id,
      priority: "urgent",
      status: "in_progress",
      dueDate: new Date(Date.now() + 86400000 * 4),
      progressPercentage: 55,
      tags: ["Finance", "GST", "Accounts"],
      activityLogs: [
        {
          action: "Task Created",
          by: { _id: admin?._id, name: "Vikram Malhotra", role: "admin" },
          note: "Assigned monthly tax reconciliation to Priya Sharma.",
          timestamp: new Date(Date.now() - 86400000 * 2),
        },
        {
          action: "Status changed: PENDING → IN_PROGRESS",
          by: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          note: "Auditing input tax credit ledgers against supplier portals.",
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
      comments: [
        {
          author: { _id: admin?._id, name: "Vikram Malhotra", role: "admin" },
          message: "Please ensure all client e-way bills and credit notes are audited before month-end.",
          createdAt: new Date(Date.now() - 86400000 * 2),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(),
    },
    {
      title: "Prepare Corporate Presentation & Client Onboarding Kit",
      description: "Draft company welcome portfolio, standardize service agreement templates, and compile onboarding checklist for upcoming corporate client visits.",
      assignedBy: priya?._id,
      assignedTo: aarav?._id,
      managerInCharge: priya?._id,
      priority: "high",
      status: "in_review",
      dueDate: new Date(Date.now() + 86400000 * 2),
      progressPercentage: 85,
      tags: ["Operations", "ClientRelations", "Documentation"],
      activityLogs: [
        {
          action: "Task Created",
          by: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          note: "Assigned to Aarav Patel.",
          timestamp: new Date(Date.now() - 86400000 * 3),
        },
        {
          action: "Status changed: IN_PROGRESS → IN_REVIEW",
          by: { _id: aarav?._id, name: "Aarav Patel", role: "employee" },
          note: "Deck updated with service scope and executive summary. Shared for review.",
          timestamp: new Date(Date.now() - 3600000 * 4),
        },
      ],
      comments: [
        {
          author: { _id: aarav?._id, name: "Aarav Patel", role: "employee" },
          message: "Deck updated with service scope and executive summary. Ready for review!",
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(),
    },
    {
      title: "Design Festival Campaign Creatives & Client Greetings",
      description: "Create branded social media banners, customized festive client greeting cards, and digital catalog assets for upcoming holiday season.",
      assignedBy: priya?._id,
      assignedTo: neha?._id,
      managerInCharge: priya?._id,
      priority: "medium",
      status: "completed",
      dueDate: new Date(Date.now() - 86400000),
      progressPercentage: 100,
      tags: ["Marketing", "Creative", "Branding"],
      activityLogs: [
        {
          action: "Task Created",
          by: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          note: "Assigned to Neha Gupta.",
          timestamp: new Date(Date.now() - 86400000 * 5),
        },
        {
          action: "Status changed: IN_REVIEW → COMPLETED",
          by: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          note: "Approved! Clean festive designs.",
          timestamp: new Date(Date.now() - 86400000),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(),
    },
    {
      title: "Follow up with Mumbai Corporate Accounts for Contract Renewals",
      description: "Contact designated relationship managers, review active annual maintenance contracts, and issue renewed service quotation proposals.",
      assignedBy: rahul?._id,
      assignedTo: rohan?._id,
      managerInCharge: rahul?._id,
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 86400000 * 6),
      progressPercentage: 0,
      tags: ["Sales", "Accounts", "Corporate"],
      activityLogs: [
        {
          action: "Task Created",
          by: { _id: rahul?._id, name: "Rahul Verma", role: "manager" },
          note: "Assigned to Rohan Mehta.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Review Office Facilities & Vendor Logistics Schedule",
      description: "Consolidate stationery, pantry, and IT maintenance quotes for the upcoming quarter across Mumbai and Pune hubs.",
      assignedBy: priya?._id,
      assignedTo: aarav?._id,
      managerInCharge: priya?._id,
      priority: "normal",
      status: "assigned",
      dueDate: new Date(Date.now() + 86400000 * 5),
      progressPercentage: 15,
      tags: ["Administration", "Logistics", "Operations"],
      activityLogs: [
        {
          action: "Task Created",
          by: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          note: "Assigned vendor consolidation to Aarav Patel.",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("Seeded 5 realistic Indian business tasks.");

  // Update queries as well
  await queries.deleteMany({});
  await queries.insertMany([
    {
      title: "Clarification on Client Payment Terms for Apex Enterprises",
      description: "Client is requesting a 45-day credit cycle instead of our standard 30-day payment term for their annual maintenance order. Can we approve this waiver?",
      category: "operations",
      priority: "urgent",
      raisedBy: aarav?._id,
      assignedTo: priya?._id,
      status: "in_progress",
      responses: [
        {
          sender: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          message: "I checked their previous payment track record; they have been consistent. We can approve 45 days for this cycle.",
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
      ],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    },
    {
      title: "Discrepancy in Vendor Transport Invoice - Delhi Branch",
      description: "Courier partner has charged ₹4,200 extra on shipment consignment #882. Requesting admin verification before releasing vendor payment.",
      category: "resource",
      priority: "urgent",
      raisedBy: priya?._id,
      assignedTo: admin?._id,
      escalatedTo: admin?._id,
      status: "open",
      responses: [
        {
          sender: { _id: priya?._id, name: "Priya Sharma", role: "manager" },
          message: "[ESCALATED TO ADMIN] Escalated for billing review and authorization.",
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 5),
      updatedAt: new Date(),
    },
  ]);
  console.log("Seeded realistic Indian business queries.");

  process.exit(0);
}

migrate().catch(e => {
  console.error("Migration error:", e);
  process.exit(1);
});
