import nodemailer from "nodemailer";

interface SendReportOptions {
  recipientEmail: string;
  recipientName: string;
  reportPeriod: string;
  summary: {
    totalActiveSeconds: number;
    totalIdleSeconds: number;
    totalDaysWorked: number;
    avgDailyActiveSeconds: number;
    productivityScore: number;
  };
  logs: Array<{
    date: string;
    firstSeenAt: string | Date;
    lastSeenAt: string | Date;
    activeSeconds: number;
    idleSeconds: number;
    dayStatus: string;
  }>;
  customNote?: string;
  adminName?: string;
  ccEmail?: string;
}

const formatSeconds = (sec: number = 0): string => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0 && m === 0) return "0m";
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const formatTime = (d?: string | Date): string => {
  if (!d) return "--:--";
  const dateObj = new Date(d);
  return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export class EmailReportService {
  static async sendReport(opts: SendReportOptions) {
    const {
      recipientEmail,
      recipientName,
      reportPeriod,
      summary,
      logs,
      customNote,
      adminName = "Administrator",
      ccEmail,
    } = opts;

    // Generate table rows HTML
    const tableRows = logs
      .map((log) => {
        let statusBadge = "#64748b";
        let statusText = "Active";
        if (log.dayStatus === "full_day") {
          statusBadge = "#059669";
          statusText = "Full Day";
        } else if (log.dayStatus === "overtime") {
          statusBadge = "#2563eb";
          statusText = "Overtime";
        } else if (log.dayStatus === "half_day") {
          statusBadge = "#d97706";
          statusText = "Half Day";
        } else if (log.dayStatus === "short_day") {
          statusBadge = "#ea580c";
          statusText = "Short Day";
        }

        return `
          <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155;">
            <td style="padding: 10px 12px; font-weight: 600;">${log.date}</td>
            <td style="padding: 10px 12px;">${formatTime(log.firstSeenAt)}</td>
            <td style="padding: 10px 12px;">${formatTime(log.lastSeenAt)}</td>
            <td style="padding: 10px 12px; font-weight: bold; color: #4338ca;">${formatSeconds(log.activeSeconds)}</td>
            <td style="padding: 10px 12px; color: #64748b;">${formatSeconds(log.idleSeconds)}</td>
            <td style="padding: 10px 12px;">
              <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #ffffff; background-color: ${statusBadge};">
                ${statusText}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 28px 32px; }
            .content { padding: 32px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .stat-box { background: #f1f5f9; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .stat-value { font-size: 18px; font-weight: 900; color: #0f172a; }
            .note-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 10px 10px 0; margin-bottom: 24px; font-size: 13px; color: #1e40af; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { background: #f8fafc; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; }
            .footer { background: #f8fafc; padding: 16px 32px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #a5b4fc;">Nexton Enterprise • Telemetry Audit</div>
              <h1 style="margin: 6px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Official Work Hours & Presence Report</h1>
              <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">Reporting Period: <strong>${reportPeriod}</strong></div>
            </div>

            <div class="content">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">
                Hello <strong>${recipientName}</strong>,
              </p>
              <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                Enclosed is your verified work hours, screen time, and portal activity summary compiled directly from Nexton's ambient telemetry system.
              </p>

              ${
                customNote
                  ? `
                  <div class="note-box">
                    <strong style="display: block; margin-bottom: 4px; font-size: 12px;">Note from ${adminName}:</strong>
                    ${customNote}
                  </div>
                `
                  : ""
              }

              <!-- Summary Highlights -->
              <div style="margin: 24px 0 16px 0;">
                <table style="width: 100%; border: none;">
                  <tr>
                    <td style="width: 25%; padding: 4px;">
                      <div class="stat-box">
                        <div class="stat-label">Active Work</div>
                        <div class="stat-value" style="color: #4338ca;">${formatSeconds(summary.totalActiveSeconds)}</div>
                      </div>
                    </td>
                    <td style="width: 25%; padding: 4px;">
                      <div class="stat-box">
                        <div class="stat-label">Daily Avg Active</div>
                        <div class="stat-value">${formatSeconds(summary.avgDailyActiveSeconds)}</div>
                      </div>
                    </td>
                    <td style="width: 25%; padding: 4px;">
                      <div class="stat-box">
                        <div class="stat-label">Idle / Break</div>
                        <div class="stat-value" style="color: #64748b;">${formatSeconds(summary.totalIdleSeconds)}</div>
                      </div>
                    </td>
                    <td style="width: 25%; padding: 4px;">
                      <div class="stat-box">
                        <div class="stat-label">Productivity</div>
                        <div class="stat-value" style="color: #059669;">${summary.productivityScore}%</div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Day-by-Day Table -->
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 24px 0 12px 0;">Itemized Daily Log</h3>
              <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>First Seen</th>
                      <th>Last Seen</th>
                      <th>Active Time</th>
                      <th>Idle Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows || `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">No activity logged during this range.</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="footer">
              Nexton Operations Portal • Verified Automated Telemetry Engine • Generated on ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
      </html>
    `;

    // Check SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Nexton Enterprise" <${smtpUser}>`,
        to: recipientEmail,
        cc: ccEmail || undefined,
        subject: `Nexton Work Hours & Telemetry Report — ${reportPeriod}`,
        html: htmlContent,
      });

      console.log("[EmailReportService] Email successfully delivered:", info.messageId);
      return { success: true, messageId: info.messageId, delivered: true };
    } else {
      console.log(
        `[EmailReportService] SMTP credentials not set in .env.local. Report generated for ${recipientEmail} (${logs.length} days). Returning preview.`
      );
      return {
        success: true,
        delivered: false,
        simulated: true,
        recipientEmail,
        previewHtml: htmlContent,
        note: "Report generated successfully. To deliver real external emails, configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env.local.",
      };
    }
  }
}

export default EmailReportService;
