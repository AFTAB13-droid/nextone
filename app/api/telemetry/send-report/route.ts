import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { TelemetryService } from "@/services/telemetryService";
import { EmailReportService } from "@/services/emailReportService";

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();

    // Only Admin or Manager can email telemetry reports
    if (actor.role !== "admin" && actor.role !== "manager") {
      return NextResponse.json({ error: "Unauthorized. Admin or Manager role required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, range = "this_month", startDate, endDate, customNote, ccEmail } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // 1. Fetch user telemetry
    const telemetryData = await TelemetryService.getUserTelemetry(userId, range, startDate, endDate);

    // Format human readable report period
    let periodLabel = `${telemetryData.range.startDate} to ${telemetryData.range.endDate}`;
    if (range === "this_month") {
      const d = new Date();
      periodLabel = d.toLocaleString("default", { month: "long", year: "numeric" });
    } else if (range === "today") {
      periodLabel = `Today (${new Date().toLocaleDateString()})`;
    }

    // 2. Send email report
    const emailResult = await EmailReportService.sendReport({
      recipientEmail: telemetryData.user.email,
      recipientName: telemetryData.user.name,
      reportPeriod: periodLabel,
      summary: telemetryData.summary,
      logs: telemetryData.logs,
      customNote,
      adminName: actor.name || "Administrator",
      ccEmail,
    });

    return NextResponse.json({
      success: true,
      delivered: emailResult.delivered,
      simulated: emailResult.simulated,
      recipientEmail: telemetryData.user.email,
      period: periodLabel,
      note: emailResult.note,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error sending report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
