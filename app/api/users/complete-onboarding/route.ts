import { NextResponse } from "next/server";
import { requireAuth, AUTH_COOKIE_NAME } from "@/lib/auth";
import UserService from "@/services/userService";
import { signToken } from "@/lib/jwt";
import { AuthSession } from "@/lib/types";

export async function POST() {
  try {
    const session = await requireAuth();

    const updatedUser = await UserService.completeFirstLogin(session.userId);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedSession: AuthSession = {
      ...session,
      firstLoginCompleted: true,
    };

    const token = await signToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        userId: updatedUser._id.toString(),
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete onboarding";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
