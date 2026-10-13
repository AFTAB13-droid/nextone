import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import NotificationService from "@/services/notificationService";

export async function GET() {
  try {
    const actor = await requireAuth();
    const [notifications, unreadCount] = await Promise.all([
      NotificationService.getUserNotifications(actor.userId, 25),
      NotificationService.getUnreadCount(actor.userId),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching notifications";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const actor = await requireAuth();
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const success = await NotificationService.markAsRead(notificationId, actor.userId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating notification";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
