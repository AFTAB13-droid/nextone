import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { TelemetryService } from "@/services/telemetryService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let targetUserId = "";

    try {
      const actor = await requireAuth();
      targetUserId = actor.userId;
    } catch {
      if (body.userId) {
        targetUserId = body.userId;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ success: false, ignored: true, reason: "No user identified" }, { status: 200 });
    }

    if (body.action === "leave") {
      await TelemetryService.recordLeave(targetUserId);
      return NextResponse.json({ success: true, status: "offline" });
    }

    const payload = {
      state: body.state || "active",
      durationSeconds: body.durationSeconds || 60,
      currentPath: body.currentPath || "",
      deviceInfo: body.deviceInfo || {},
    };

    const record = await TelemetryService.recordHeartbeat(targetUserId, payload);
    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error recording heartbeat";
    // If not authenticated, return graceful 200 to keep client console clean
    return NextResponse.json({ success: false, ignored: true, error: message }, { status: 200 });
  }
}
