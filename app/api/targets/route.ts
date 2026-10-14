import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import TargetService from "@/services/targetService";

export async function GET(req: Request) {
  try {
    const actor = await requireAuth();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const employeeId = searchParams.get("employeeId");
    const managerId = searchParams.get("managerId") || undefined;

    // If an employee is requesting their own target for a specific date
    if (actor.role === "employee" || (employeeId && employeeId === actor.userId)) {
      const target = await TargetService.getEmployeeTarget(actor.userId, date);
      return NextResponse.json({ target });
    }

    // If manager or admin is requesting target of a specific employee
    if (employeeId) {
      const target = await TargetService.getEmployeeTarget(employeeId, date);
      return NextResponse.json({ target });
    }

    // Manager or Admin requesting all targets for that date
    const targets = await TargetService.getTargetsForDate(actor, date, managerId);
    return NextResponse.json({ targets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch targets";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAuth(["employee"]);
    const body = await req.json();

    if (!body.targetText || !body.targetText.trim()) {
      return NextResponse.json({ error: "Target commitment text is required" }, { status: 400 });
    }

    const savedTarget = await TargetService.saveTodayTarget(
      actor.userId,
      body.targetText,
      body.progressNotes,
      body.status
    );

    return NextResponse.json({ success: true, target: savedTarget });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save today's target";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
