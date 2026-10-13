import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import NotificationService from "@/services/notificationService";

export async function DELETE() {
  try {
    const actor = await requireAuth();
    const success = await NotificationService.deleteAllNotifications(actor.userId);
    return NextResponse.json({ success, message: "All notifications cleared" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error clearing notifications";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
