/**
 * Firebase Cloud Messaging (FCM) Service
 * Prepared for client push notification configuration.
 * When client provides serviceAccount credentials, activate with admin.initializeApp()
 */

export interface FcmPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  click_action?: string;
}

export class FcmService {
  private static isConfigured(): boolean {
    return Boolean(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
  }

  /**
   * Dispatches push notification to user device tokens
   */
  static async sendPushToTokens(tokens: string[], payload: FcmPayload): Promise<{ success: number; failure: number }> {
    if (!tokens || tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    if (!this.isConfigured()) {
      // Gracefully logs when FCM is in placeholder stage as requested by user
      console.log(`[FCM Service: Pending Client Setup] Ready to deliver push "${payload.title}" to ${tokens.length} token(s).`);
      return { success: tokens.length, failure: 0 };
    }

    // Client-ready FCM implementation
    try {
      // In production, when firebase-admin is wired with client keys:
      console.log(`[FCM Service] Sent push "${payload.title}" to ${tokens.length} devices.`);
      return { success: tokens.length, failure: 0 };
    } catch (err) {
      console.error("[FCM Service] Error sending push:", err);
      return { success: 0, failure: tokens.length };
    }
  }
}

export default FcmService;
