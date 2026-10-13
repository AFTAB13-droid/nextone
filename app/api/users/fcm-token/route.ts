import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import UserService from "@/services/userService";

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    await UserService.registerFcmToken(actor.userId, token);
    return NextResponse.json({ success: true, message: "FCM token saved" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error saving FCM token";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
