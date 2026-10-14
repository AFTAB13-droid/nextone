/**
 * Safe, Non-Blocking Email Dispatcher
 * Per Section 9: "Email delivery failure must not prevent the task or query from being saved successfully."
 */

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
}

export class EmailService {
  static async sendNotificationEmail(payload: EmailPayload): Promise<boolean> {
    try {
      // In development / staging without SMTP server configured, safely log email event
      const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

      if (!isSmtpConfigured) {
        console.log(`[Email Dispatcher] Mock sent to "${payload.to}": "${payload.subject}"`);
        return true;
      }

      // Production SMTP integration placeholder
      return true;
    } catch (err: unknown) {
      // Per Section 9: Non-blocking error handling
      console.warn(`[Email Dispatcher Warning] Failed to deliver email to ${payload.to}:`, err);
      return false;
    }
  }
}

export default EmailService;
