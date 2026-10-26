import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import FcmService from "@/services/fcmService";
import { INotification } from "@/lib/types";

export class NotificationService {
  /**
   * Creates an in-app notification in MongoDB AND dispatches desktop FCM Web Push
   */
  static async createNotification(
    recipientId: string,
    title: string,
    message: string,
    link: string = "",
    type: "task" | "query" | "target" | "system" | "hierarchy" = "system"
  ): Promise<INotification> {
    await connectDB();

    const notif = await Notification.create({
      recipient: recipientId,
      title,
      message,
      link,
      type,
      isRead: false,
    });

    // Asynchronously dispatch Desktop Web Push via FCM (non-blocking)
    FcmService.sendPushToUser(recipientId, {
      title,
      body: message,
      click_action: link,
      icon: "/icon-192.png",
    }).catch((err) => {
      console.error("[NotificationService] Desktop push delivery error:", err);
    });

    return notif.toObject() as INotification;
  }

  /**
   * Creates batch notifications for multiple users (e.g. Broadcasts, team announcements)
   * Stores records in MongoDB and dispatches multicast FCM Web Push
   */
  static async createBatchNotifications(
    recipientIds: string[],
    title: string,
    message: string,
    link: string = "",
    type: "task" | "query" | "target" | "system" | "hierarchy" = "system"
  ): Promise<void> {
    if (!recipientIds || recipientIds.length === 0) return;
    await connectDB();

    const uniqueRecipients = Array.from(new Set(recipientIds.filter(Boolean)));
    const batch = uniqueRecipients.map((recId) => ({
      recipient: recId,
      title,
      message,
      link,
      type,
      isRead: false,
    }));

    await Notification.insertMany(batch);

    // Asynchronously dispatch Desktop Web Push via FCM
    FcmService.sendPushToMultipleUsers(uniqueRecipients, {
      title,
      body: message,
      click_action: link,
      icon: "/icon-192.png",
    }).catch((err) => {
      console.error("[NotificationService] Batch desktop push error:", err);
    });
  }

  static async getUserNotifications(userId: string, limit: number = 100): Promise<INotification[]> {
    await connectDB();
    const list = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return list as unknown as INotification[];
  }

  static async getUnreadCount(userId: string): Promise<number> {
    await connectDB();
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    await connectDB();
    const result = await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    await connectDB();
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return result.modifiedCount > 0;
  }

  static async setNotificationReadStatus(
    notificationId: string,
    userId: string,
    isRead: boolean
  ): Promise<boolean> {
    await connectDB();
    const result = await Notification.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { isRead } }
    );
    return result.modifiedCount > 0;
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    await connectDB();
    const result = await Notification.deleteOne({ _id: notificationId, recipient: userId });
    return result.deletedCount > 0;
  }

  static async deleteAllNotifications(userId: string): Promise<boolean> {
    await connectDB();
    const result = await Notification.deleteMany({ recipient: userId });
    return result.deletedCount > 0;
  }
}

export default NotificationService;
