import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { INotification } from "@/lib/types";

export class NotificationService {
  static async createNotification(
    recipientId: string,
    title: string,
    message: string,
    link: string = "",
    type: "task" | "query" | "system" | "hierarchy" = "system"
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

    return notif.toObject() as INotification;
  }

  static async getUserNotifications(userId: string, limit: number = 20): Promise<INotification[]> {
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
