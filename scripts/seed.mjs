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
    const passwordHash = await bcrypt.hash("NextOne@2025", salt);

    console.log("[Seed] Creating Admin account...");
    const adminRes = await usersCollection.findOneAndUpdate(
      { email: "admin@nextone.com" },
      {
        $set: {
          name: "NextOne Executive Admin",
          email: "admin@nextone.com",
          password: passwordHash,
          role: "admin",
          department: "Executive Management",
          designation: "Chief Operations Officer",
          phone: "+1 800-555-0199",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          isActive: true,
          firstLoginCompleted: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const adminId = adminRes._id || (await usersCollection.findOne({ email: "admin@nextone.com" }))._id;

    console.log("[Seed] Creating Managers...");
    const m1Res = await usersCollection.findOneAndUpdate(
      { email: "sarah.lead@nextone.com" },
      {
        $set: {
          name: "Sarah Jenkins",
          email: "sarah.lead@nextone.com",
          password: passwordHash,
          role: "manager",
          department: "Engineering & Tech",
          designation: "Principal Tech Lead",
          avatar: "/avatars/avatar-female-3d.jpg",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const m1Id = m1Res._id || (await usersCollection.findOne({ email: "sarah.lead@nextone.com" }))._id;

    const m2Res = await usersCollection.findOneAndUpdate(
      { email: "david.lead@nextone.com" },
      {
        $set: {
          name: "David Miller",
          email: "david.lead@nextone.com",
          password: passwordHash,
          role: "manager",
          department: "Product & Growth",
          designation: "Product Director",
          avatar: "/avatars/avatar-male-3d.jpg",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );
    const m2Id = m2Res._id || (await usersCollection.findOne({ email: "david.lead@nextone.com" }))._id;

    console.log("[Seed] Creating Employees under Managers...");
    await usersCollection.findOneAndUpdate(
      { email: "alex.dev@nextone.com" },
      {
        $set: {
          name: "Alex Rivera",
          email: "alex.dev@nextone.com",
          password: passwordHash,
          role: "employee",
          managerId: m1Id,
          department: "Engineering & Tech",
          designation: "Senior Frontend Engineer",
          avatar: "/avatars/avatar-male-3d.jpg",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.findOneAndUpdate(
      { email: "emily.design@nextone.com" },
      {
        $set: {
          name: "Emily Chen",
          email: "emily.design@nextone.com",
          password: passwordHash,
          role: "employee",
          managerId: m1Id,
          department: "Engineering & Tech",
          designation: "UI/UX Product Designer",
          avatar: "/avatars/avatar-female-3d.jpg",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await usersCollection.findOneAndUpdate(
      { email: "marcus.growth@nextone.com" },
      {
        $set: {
          name: "Marcus Vance",
          email: "marcus.growth@nextone.com",
          password: passwordHash,
          role: "employee",
          managerId: m2Id,
          department: "Product & Growth",
          designation: "Growth Marketing Specialist",
          avatar: "/avatars/avatar-male-3d.jpg",
          isActive: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    console.log("[Seed] Completed! Sample credentials ready: NextOne@2025");
    process.exit(0);
  } catch (err) {
    console.error("[Seed Error]", err.message);
    process.exit(1);
  }
}

runSeed();
