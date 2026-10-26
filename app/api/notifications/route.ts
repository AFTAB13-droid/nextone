import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import NotificationService from "@/services/notificationService";

export async function GET(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 10), 200) : 100;

    const [notifications, unreadCount] = await Promise.all([
      NotificationService.getUserNotifications(actor.userId, limit),
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
    const { notificationId, isRead = true } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const success = await NotificationService.setNotificationReadStatus(
      notificationId,
      actor.userId,
      Boolean(isRead)
    );
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating notification";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);
    let notificationId = searchParams.get("id");

    if (!notificationId) {
      try {
        const body = await req.json();
        notificationId = body.notificationId;
      } catch {
        // body might be empty if using query params
      }
    }

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const success = await NotificationService.deleteNotification(notificationId, actor.userId);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting notification";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
