import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import UserService from "@/services/userService";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await requireAuth();
    const user = await UserService.getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const actor = await requireAuth();
    // Only Admin can edit other users; users can edit their own profile
    if (actor.role !== "admin" && actor.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await UserService.updateUser(params.id, body);

    return NextResponse.json({ success: true, user: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await requireAuth(["admin"]);
    const deleted = await UserService.deleteUser(params.id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error deleting user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
