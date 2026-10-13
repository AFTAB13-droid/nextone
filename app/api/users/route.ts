import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import UserService from "@/services/userService";

export async function GET(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    if (role === "manager") {
      const managers = await UserService.getManagers();
      return NextResponse.json({ users: managers });
    }

    if (role === "employee") {
      const employees = await UserService.getEmployees();
      return NextResponse.json({ users: employees });
    }

    // If manager requests their team members
    if (actor.role === "manager" && searchParams.get("team") === "true") {
      const team = await UserService.getEmployeesByManager(actor.userId);
      return NextResponse.json({ users: team });
    }

    // Admin can get all users
    const all = await UserService.getAllUsers();
    return NextResponse.json({ users: all });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    // Only Admin can create users
    await requireAuth(["admin"]);

    const body = await req.json();
    const newUser = await UserService.createUser(body);

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
