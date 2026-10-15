import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import UserService from "@/services/userService";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const fullUser = await UserService.getUserById(session.userId);
    const userPayload = fullUser
      ? { ...fullUser, userId: fullUser._id.toString() }
      : { ...session, _id: session.userId };
    return NextResponse.json({ user: userPayload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Auth check failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
