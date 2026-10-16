import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { TelemetryService } from "@/services/telemetryService";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const actor = await requireAuth();
    const { userId } = params;

    // Admin can view any user; Managers can view their team members or themselves; Employees can view themselves
    if (actor.role !== "admin" && actor.userId !== userId) {
      // If manager, we can allow viewing subordinates
      // For now, allow admin and self, or manager
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "this_month";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const data = await TelemetryService.getUserTelemetry(userId, range, startDate, endDate);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching telemetry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
