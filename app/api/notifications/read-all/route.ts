import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import NotificationService from "@/services/notificationService";

export async function POST() {
  try {
    const actor = await requireAuth();
    const success = await NotificationService.markAllAsRead(actor.userId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error marking all read";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
