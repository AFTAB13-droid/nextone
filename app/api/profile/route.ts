import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import Query from "@/models/Query";
import AuthService from "@/services/authService";

export async function GET() {
  try {
    const actor = await requireAuth();
    await connectDB();

    const userDoc = await User.findById(actor.userId)
      .populate("managerId", "name email role designation department phone avatar")
      .select("-password")
      .lean();

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Performance metrics for this user
    let subordinates: any[] = [];
    if (userDoc.role === "manager") {
      subordinates = await User.find({ managerId: userDoc._id, isActive: true })
        .select("-password")
        .sort({ name: 1 })
        .lean();
    }

    const [tasksAssignedToMe, tasksAssignedByMe, myQueries] = await Promise.all([
      Task.find({ assignedTo: userDoc._id }).lean(),
      Task.find({ assignedBy: userDoc._id }).lean(),
      Query.find({ raisedBy: userDoc._id }).lean(),
    ]);

    const completedCount = tasksAssignedToMe.filter((t) => t.status === "completed").length;
    const inReviewCount = tasksAssignedToMe.filter((t) => t.status === "in_review").length;
    const activeCount = tasksAssignedToMe.filter((t) => t.status !== "completed").length;
    const rate = tasksAssignedToMe.length > 0
      ? Math.round((completedCount / tasksAssignedToMe.length) * 100)
      : 100;

    return NextResponse.json({
      user: userDoc,
      subordinates,
      stats: {
        totalTasks: tasksAssignedToMe.length,
        activeTasks: activeCount,
        completedTasks: completedCount,
        inReviewTasks: inReviewCount,
        completionRate: rate,
        delegatedTasksCount: tasksAssignedByMe.length,
        totalQueries: myQueries.length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const actor = await requireAuth();
    await connectDB();

    const { name, phone, department, designation, avatar, currentPassword, newPassword } =
      await req.json();

    const userDoc = await User.findById(actor.userId).select("+password");
    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) userDoc.name = name.trim();
    if (typeof phone === "string") userDoc.phone = phone.trim();
    if (department && actor.role === "admin") userDoc.department = department.trim();
    if (designation && actor.role === "admin") userDoc.designation = designation.trim();
    if (avatar) userDoc.avatar = avatar;

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }
      if (!userDoc.password) {
        return NextResponse.json(
          { error: "Account password not initialized" },
          { status: 400 }
        );
      }
      const isMatch = await AuthService.comparePassword(currentPassword, userDoc.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Current password does not match" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }
      userDoc.password = await AuthService.hashPassword(newPassword);
    }

    await userDoc.save();

    const updated = await User.findById(actor.userId)
      .populate("managerId", "name email role designation department phone avatar")
      .select("-password")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
