import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import InteractionService from "@/services/interactionService";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Interaction ID is required" },
        { status: 400 }
      );
    }

    const updated = await InteractionService.markAsRead(id, session.userId);

    return NextResponse.json({ success: true, updated });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to mark interaction as read";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
