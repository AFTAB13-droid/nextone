import admin from "firebase-admin";
import { getFirebaseAdmin, isFirebaseAdminConfigured } from "@/lib/firebaseAdmin";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export interface FcmPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  click_action?: string;
  tag?: string;
}

export class FcmService {
  /**
   * Dispatches desktop web push notification to a list of device tokens
   */
  static async sendPushToTokens(
    tokens: string[],
    payload: FcmPayload,
    userIdToPrune?: string
  ): Promise<{ success: number; failure: number }> {
    if (!tokens || tokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    // Filter valid unique non-empty tokens
    const uniqueTokens = Array.from(new Set(tokens.filter((t) => typeof t === "string" && t.trim().length > 0)));
    if (uniqueTokens.length === 0) {
      return { success: 0, failure: 0 };
    }

    if (!isFirebaseAdminConfigured()) {
      console.log(
        `[FCM Service: Ready for Client Credentials] Desktop push "${payload.title}" ready to dispatch to ${uniqueTokens.length} device(s).`
      );
      return { success: uniqueTokens.length, failure: 0 };
    }

    const app = getFirebaseAdmin();
    if (!app) {
      console.warn("[FCM Service] Firebase Admin not initialized. Skipping push delivery.");
      return { success: 0, failure: uniqueTokens.length };
    }

    try {
      const messaging = admin.messaging(app);

      const response = await messaging.sendEachForMulticast({
        tokens: uniqueTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        webpush: {
          fcmOptions: {
            link: payload.click_action || "/",
          },
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || "/favicon.svg",
            badge: "/favicon.svg",
            requireInteraction: true,
            tag: payload.tag || "nextone-desktop-alert",
          },
        },
        data: {
          title: payload.title,
          body: payload.body,
          link: payload.click_action || "/",
          ...payload.data,
        },
      });

      console.log(
        `[FCM Service] Sent push "${payload.title}": ${response.successCount} succeeded, ${response.failureCount} failed.`
      );

      // Prune dead/unregistered tokens if any failed
      if (response.failureCount > 0 && userIdToPrune) {
        const deadTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === "messaging/registration-token-not-registered" ||
              errCode === "messaging/invalid-registration-token" ||
              errCode === "messaging/invalid-argument"
            ) {
              deadTokens.push(uniqueTokens[idx]);
            }
          }
        });

        if (deadTokens.length > 0) {
          await connectDB();
          await User.findByIdAndUpdate(userIdToPrune, {
            $pull: { fcmTokens: { $in: deadTokens } },
          });
          console.log(`[FCM Service] Pruned ${deadTokens.length} expired token(s) for user ${userIdToPrune}`);
        }
      }

      return { success: response.successCount, failure: response.failureCount };
    } catch (err) {
      console.error("[FCM Service] Error sending multicast push:", err);
      return { success: 0, failure: uniqueTokens.length };
    }
  }

  /**
   * Helper to dispatch desktop push directly to a user's registered devices
   */
  static async sendPushToUser(userId: string, payload: FcmPayload): Promise<void> {
    try {
      await connectDB();
      const user = await User.findById(userId).select("fcmTokens name email").lean();
      if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
        return;
      }

      await this.sendPushToTokens(user.fcmTokens, payload, userId);
    } catch (err) {
      console.error(`[FCM Service] Failed to send push to user ${userId}:`, err);
    }
  }

  /**
   * Helper to dispatch desktop push to multiple users (e.g. broadcasts or whole teams)
   */
  static async sendPushToMultipleUsers(userIds: string[], payload: FcmPayload): Promise<void> {
    try {
      await connectDB();
      const users = await User.find({ _id: { $in: userIds }, isActive: true })
        .select("fcmTokens")
        .lean();

      const allTokens: string[] = [];
      users.forEach((u) => {
        if (u.fcmTokens && Array.isArray(u.fcmTokens)) {
          allTokens.push(...u.fcmTokens);
        }
      });

      if (allTokens.length > 0) {
        await this.sendPushToTokens(allTokens, payload);
      }
    } catch (err) {
      console.error("[FCM Service] Failed to send push to multiple users:", err);
    }
  }
}

export default FcmService;
