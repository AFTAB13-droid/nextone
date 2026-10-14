import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TargetService from "@/services/targetService";

export async function GET(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || actor.userId;

    // Permissions check: Employee can only view their own history
    if (actor.role === "employee" && employeeId !== actor.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const history = await TargetService.getTargetHistory(employeeId, 30);
    return NextResponse.json({ history });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching target history";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
