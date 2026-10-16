"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
};

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured()) return null;
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};

/**
 * Checks if desktop push notifications are supported and permitted
 */
export const getDesktopNotificationStatus = async (): Promise<"granted" | "denied" | "default" | "unsupported"> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const supported = await isSupported().catch(() => false);
  if (!supported) return "unsupported";

  return Notification.permission;
};

/**
 * Requests desktop permission, registers FCM service worker, and saves token to DB
 */
export const requestDesktopPushPermission = async (): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return { success: false, error: "Notifications are not supported in this browser." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission was not granted." };
    }

    if (!isFirebaseConfigured()) {
      console.warn(
        "[FCM Client] Firebase credentials pending in .env.local (NEXT_PUBLIC_FIREBASE_*). Notification permission granted."
      );
      return {
        success: true,
        error: "Permission granted, but Firebase keys are pending configuration in .env.local.",
      };
    }

    const app = getFirebaseApp();
    if (!app) {
      return { success: false, error: "Firebase app could not be initialized." };
    }

    const messaging = getMessaging(app);

    // Register service worker explicitly for desktop scope
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    // Obtain token with VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey,
    });

    if (token) {
      // Save token to backend user profile
      await fetch("/api/users/fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      console.log("[FCM Client] Desktop FCM token successfully saved to NextOne backend.");
      return { success: true, token };
    } else {
      return { success: false, error: "Failed to retrieve device push token." };
    }
  } catch (err: any) {
    console.error("[FCM Client] Error enabling desktop push notifications:", err);
    return { success: false, error: err?.message || "Failed to setup push notifications." };
  }
};

/**
 * Attaches foreground push listener to display in-app notifications while tab is open
 */
export const attachForegroundMessageListener = (
  callback: (payload: { title: string; body: string; link?: string }) => void
) => {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return () => {};

  try {
    const app = getFirebaseApp();
    if (!app) return () => {};

    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log("[FCM Client] Foreground push message received:", payload);
      const title = payload.notification?.title || payload.data?.title || "NextOne Update";
      const body = payload.notification?.body || payload.data?.body || "";
      const link = payload.data?.link || payload.notification?.click_action || "";

      callback({ title, body, link });
    });
  } catch (e) {
    console.warn("[FCM Client] Could not attach foreground listener:", e);
    return () => {};
  }
};
