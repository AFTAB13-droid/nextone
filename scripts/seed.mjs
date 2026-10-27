/**
 * Standalone MongoDB Seeder Script
 * Run with: npm run seed
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import fs from "fs";
import path from "path";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    for (const line of envConfig.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
} catch (e) {
  // ignore
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://NEXTONE:Next678@nextone.1frrsde.mongodb.net/nextone?retryWrites=true&w=majority";

async function runSeed() {
  console.log(`[Seed] Connecting to ${MONGODB_URI}...`);
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 5000 });
    console.log("[Seed] Connected to MongoDB.");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const tasksCollection = db.collection("tasks");
    const queriesCollection = db.collection("queries");
    const notifsCollection = db.collection("notifications");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Nexton@2025", salt);

    console.log("[Seed] Creating Admin account...");
    const adminRes = await usersCollection.findOneAndUpdate(
      { email: { $in: ["admin@nexton.com", "admin@nextone.com"] } },
      {
        $set: {
          name: "Vikram Malhotra",
          email: "admin@nexton.com",
          password: passwordHash,
          role: "admin",
          department: "Executive Management",
          designation: "Managing Director",
          phone: "+91 98200 12345",
          avatar: "/avatars/man-2.svg",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const adminDoc = adminRes.value || adminRes;
    const adminId = adminDoc?._id || (await usersCollection.findOne({ email: "admin@nexton.com" }))?._id;

    console.log("[Seed] Creating Managers...");
    const m1Res = await usersCollection.findOneAndUpdate(
      { email: { $in: ["priya.sharma@nexton.com", "sarah.lead@nexton.com", "sarah.lead@nextone.com"] } },
      {
        $set: {
          name: "Priya Sharma",
          email: "priya.sharma@nexton.com",
          password: passwordHash,
          role: "manager",
          department: "Operations & Delivery",
          designation: "Senior Operations Lead",
          phone: "+91 98200 23456",
          avatar: "/avatars/woman-1.svg",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const m1Doc = m1Res.value || m1Res;
    const m1Id = m1Doc?._id || (await usersCollection.findOne({ email: "priya.sharma@nexton.com" }))?._id;

    const m2Res = await usersCollection.findOneAndUpdate(
      { email: { $in: ["rahul.verma@nexton.com", "david.lead@nexton.com", "david.lead@nextone.com"] } },
      {
        $set: {
          name: "Rahul Verma",
          email: "rahul.verma@nexton.com",
          password: passwordHash,
          role: "manager",
          department: "Accounts & Business",
          designation: "Accounts & Business Head",
          phone: "+91 98200 34567",
          avatar: "/avatars/man-2.svg",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const m2Doc = m2Res.value || m2Res;
    const m2Id = m2Doc?._id || (await usersCollection.findOne({ email: "rahul.verma@nexton.com" }))?._id;

    console.log("[Seed] Creating Employees under Managers...");
    await usersCollection.findOneAndUpdate(
      { email: { $in: ["aarav.patel@nexton.com", "alex.dev@nexton.com", "alex.dev@nextone.com"] } },
      {
        $set: {
          name: "Aarav Patel",
          email: "aarav.patel@nexton.com",
          password: passwordHash,
          role: "employee",
          managerId: m1Id,
          department: "Operations & Delivery",
          designation: "Operations Executive",
          phone: "+91 98200 45678",
          avatar: "/avatars/man-1.svg",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.findOneAndUpdate(
      { email: { $in: ["neha.gupta@nexton.com", "emily.design@nexton.com", "emily.design@nextone.com"] } },
      {
        $set: {
          name: "Neha Gupta",
          email: "neha.gupta@nexton.com",
          password: passwordHash,
          role: "employee",
          managerId: m1Id,
          department: "Marketing & Design",
          designation: "Design & Brand Specialist",
          phone: "+91 98200 56789",
          avatar: "/avatars/woman-2.svg",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.findOneAndUpdate(
      { email: { $in: ["rohan.mehta@nexton.com", "marcus.growth@nexton.com", "marcus.growth@nextone.com"] } },
      {
        $set: {
          name: "Rohan Mehta",
          email: "rohan.mehta@nexton.com",
          password: passwordHash,
          role: "employee",
          managerId: m2Id,
          department: "Accounts & Business",
          designation: "Business Development Associate",
          phone: "+91 98200 67890",
          avatar: "/avatars/man-3.svg",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    console.log("[Seed] Completed! Sample credentials ready: Nexton@2025");
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error]", err.message);
    process.exit(1);
  }
}

runSeed();
