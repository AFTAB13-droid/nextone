import connectToDatabase from "@/lib/mongodb";
import UserDailyTelemetry from "@/models/UserDailyTelemetry";
import User from "@/models/User";
import { IUserDailyTelemetry, ITelemetrySummary } from "@/lib/types";

export interface HeartbeatPayload {
  state: "active" | "idle" | "background";
  durationSeconds?: number;
  currentPath?: string;
  deviceInfo?: {
    os?: string;
    browser?: string;
    screenResolution?: string;
    ip?: string;
  };
}

export class TelemetryService {
  /**
   * Records a periodic ambient heartbeat pulse from the client portal
   */
  static async recordHeartbeat(userId: string, payload: HeartbeatPayload) {
    await connectToDatabase();

    const now = new Date();
    // Use local/ISO date string YYYY-MM-DD
    const dateStr = now.toISOString().slice(0, 10);
    const currentHour = now.getHours().toString();
    const delta = Math.min(Math.max(payload.durationSeconds || 60, 5), 180);

    const incQuery: any = {};
    const setQuery: any = {
      lastSeenAt: now,
    };

    if (payload.deviceInfo) {
      if (payload.deviceInfo.os) setQuery["deviceInfo.os"] = payload.deviceInfo.os;
      if (payload.deviceInfo.browser) setQuery["deviceInfo.browser"] = payload.deviceInfo.browser;
      if (payload.deviceInfo.screenResolution) setQuery["deviceInfo.screenResolution"] = payload.deviceInfo.screenResolution;
      if (payload.deviceInfo.ip) setQuery["deviceInfo.ip"] = payload.deviceInfo.ip;
    }

    if (payload.state === "active") {
      incQuery.activeSeconds = delta;
      incQuery.totalSeconds = delta;
      incQuery[`hourlyBlocks.${currentHour}`] = delta;
    } else if (payload.state === "idle") {
      incQuery.idleSeconds = delta;
      incQuery.totalSeconds = delta;
    } else {
      incQuery.backgroundSeconds = delta;
    }

    // 1. Upsert today's telemetry record
    const telemetry = await UserDailyTelemetry.findOneAndUpdate(
      { userId, date: dateStr },
      {
        $setOnInsert: {
          firstSeenAt: now,
          hourlyBlocks: {},
        },
        $set: setQuery,
        $inc: incQuery,
      },
      { upsert: true, new: true }
    );

    // 2. Evaluate Day Status based on accumulated active seconds
    let calculatedStatus = "active";
    const totalActive = telemetry.activeSeconds || 0;
    if (totalActive >= 30600) {
      // > 8.5 hours
      calculatedStatus = "overtime";
    } else if (totalActive >= 25200) {
      // 7-8.5 hours
      calculatedStatus = "full_day";
    } else if (totalActive >= 14400) {
      // 4-7 hours
      calculatedStatus = "half_day";
    } else if (totalActive >= 7200) {
      // 2-4 hours
      calculatedStatus = "short_day";
    }

    if (telemetry.dayStatus !== calculatedStatus) {
      telemetry.dayStatus = calculatedStatus as any;
      await telemetry.save();
    }

    // 3. Update User live presence in User collection
    const liveStatus = payload.state === "background" ? "idle" : payload.state;
    const deviceString = `${payload.deviceInfo?.os || ""} • ${payload.deviceInfo?.browser || ""}`.trim();

    await User.findByIdAndUpdate(userId, {
      $set: {
        lastActiveAt: now,
        currentStatus: liveStatus,
        currentPath: payload.currentPath || "",
        ...(deviceString ? { currentDevice: deviceString } : {}),
      },
    });

    return telemetry;
  }

  /**
   * Records tab unload or browser window leave beacon
   */
  static async recordLeave(userId: string) {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
      $set: {
        lastActiveAt: new Date(),
        currentStatus: "offline",
      },
    });
  }

  /**
   * Retrieves user telemetry for a specific date range (Today, Week, Month, or Custom)
   */
  static async getUserTelemetry(
    userId: string,
    range: string = "this_month",
    customStart?: string,
    customEnd?: string
  ) {
    await connectToDatabase();

    const user = await User.findById(userId).select("name email role department designation currentStatus lastActiveAt currentPath currentDevice");
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    let startDateStr = "";
    let endDateStr = now.toISOString().slice(0, 10);

    if (range === "today") {
      startDateStr = endDateStr;
    } else if (range === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      startDateStr = y.toISOString().slice(0, 10);
      endDateStr = startDateStr;
    } else if (range === "this_week") {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(d.setDate(diff));
      startDateStr = monday.toISOString().slice(0, 10);
    } else if (range === "last_month") {
      const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      startDateStr = firstDayPrevMonth.toISOString().slice(0, 10);
      endDateStr = lastDayPrevMonth.toISOString().slice(0, 10);
    } else if (range === "custom" && customStart && customEnd) {
      startDateStr = customStart;
      endDateStr = customEnd;
    } else {
      // Default: this_month (First day of current month to today)
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDateStr = firstDayThisMonth.toISOString().slice(0, 10);
    }

    // Query daily records in date range
    const logs = await UserDailyTelemetry.find({
      userId,
      date: { $gte: startDateStr, $lte: endDateStr },
    }).sort({ date: -1 });

    // Aggregate period metrics
    let totalActiveSec = 0;
    let totalIdleSec = 0;
    let totalBackgroundSec = 0;
    let totalWorkedDays = 0;

    for (const log of logs) {
      totalActiveSec += log.activeSeconds || 0;
      totalIdleSec += log.idleSeconds || 0;
      totalBackgroundSec += log.backgroundSeconds || 0;
      if ((log.activeSeconds || 0) > 300) {
        // Counted as a worked day if active for more than 5 minutes
        totalWorkedDays += 1;
      }
    }

    const avgDailyActive = totalWorkedDays > 0 ? Math.round(totalActiveSec / totalWorkedDays) : 0;
    const totalScreenSec = totalActiveSec + totalIdleSec;
    const productivityScore =
      totalScreenSec > 0 ? Math.min(Math.round((totalActiveSec / totalScreenSec) * 100), 100) : 0;

    // Check if user is currently active (lastActiveAt within last 3 minutes)
    let liveStatus: "active" | "idle" | "offline" = user.currentStatus || "offline";
    if (user.lastActiveAt) {
      const diffMinutes = (Date.now() - new Date(user.lastActiveAt).getTime()) / (1000 * 60);
      if (diffMinutes > 15) {
        liveStatus = "offline";
      } else if (diffMinutes > 4 && liveStatus === "active") {
        liveStatus = "idle";
      }
    } else {
      liveStatus = "offline";
    }

    const summary: ITelemetrySummary = {
      totalActiveSeconds: totalActiveSec,
      totalIdleSeconds: totalIdleSec,
      totalDaysWorked: totalWorkedDays,
      avgDailyActiveSeconds: avgDailyActive,
      productivityScore,
      currentLiveStatus: {
        status: liveStatus,
        lastActiveAt: user.lastActiveAt,
        currentPath: user.currentPath,
        deviceInfo: user.currentDevice,
      },
    };

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
      },
      range: {
        type: range,
        startDate: startDateStr,
        endDate: endDateStr,
      },
      summary,
      logs,
    };
  }
}
