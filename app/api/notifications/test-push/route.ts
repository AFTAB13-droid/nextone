import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { FcmService } from "@/services/fcmService";

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.targetUserId || actor.userId;

    await connectDB();
    const targetUser = await User.findById(targetUserId).select("name email fcmTokens");
    if (!targetUser) {
      return NextResponse.json({ success: false, error: "Target user not found" }, { status: 404 });
    }

    const tokens = targetUser.fcmTokens || [];
    if (tokens.length === 0) {
      return NextResponse.json({
        success: false,
        tokensCount: 0,
        userName: targetUser.name,
        error: `No desktop push token registered for ${targetUser.name}. To receive desktop push notifications, open Nexton in that browser, click the Bell Icon in the top header, and click "Activate Notifications" (Allow permission).`,
      });
    }

    const title = body.title || `Nexton Live Alert • ${targetUser.name}`;
    const message = body.body || `Verified Desktop FCM Web Push test dispatched at ${new Date().toLocaleTimeString()}. Operational systems nominal.`;
    const link = body.link || `/${actor.role}/tasks`;

    const pushResult = await FcmService.sendPushToUser(targetUserId, {
      title,
      body: message,
      link,
      tag: `nextone-fcm-test-${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      tokensCount: tokens.length,
      userName: targetUser.name,
      pushResult,
      message: `Desktop Push dispatched successfully to ${targetUser.name}'s registered device (${tokens.length} token${tokens.length > 1 ? "s" : ""})! Check your system tray.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error sending test push";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
