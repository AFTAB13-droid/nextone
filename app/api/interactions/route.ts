import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import InteractionService from "@/services/interactionService";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await InteractionService.getInteractions(
      session.userId,
      session.role
    );

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch interactions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin" && session.role !== "manager") {
      return NextResponse.json(
        { error: "Only Admins and Managers can dispatch broadcast messages" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      targetType,
      targetManagerId,
      recipientIds,
      subject,
      content,
      priority,
      mediaUrl,
      mediaType,
      mediaName,
    } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: "Subject title is required" },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const interaction = await InteractionService.createInteraction({
      senderId: session.userId,
      senderRole: session.role,
      targetType: targetType || "all",
      targetManagerId,
      recipientIds,
      subject: subject.trim(),
      content: content.trim(),
      priority,
      mediaUrl,
      mediaType,
      mediaName,
    });

    return NextResponse.json({ success: true, interaction }, { status: 201 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create interaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
