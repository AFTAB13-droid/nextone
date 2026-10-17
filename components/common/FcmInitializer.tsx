"use client";

import { useEffect } from "react";

export default function FcmInitializer() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("Notification" in window)) {
      return;
    }

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.messagingSenderId) {
      console.warn("[FCM Initializer] Firebase credentials missing from environment. Skipping push registration.");
      return;
    }

    const initFcm = async () => {
      try {
        // 1. Verify user is authenticated before registering push device
        const authRes = await fetch("/api/auth/me", { credentials: "include" });
        if (!authRes.ok) return;
        const authData = await authRes.json();
        if (!authData?.user) return;

        // 2. Request / check notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("[FCM Initializer] Desktop push notification permission not granted:", permission);
          return;
        }

        // 3. Dynamically import Firebase Client SDK (avoids SSR hydration issues)
        const { initializeApp, getApps, getApp } = await import("firebase/app");
        const { getMessaging, getToken, onMessage } = await import("firebase/messaging");

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        const messaging = getMessaging(app);

        // 4. Register Service Worker with dynamic config query parameters (AspireMint Architecture)
        const swUrl = `/firebase-messaging-sw.js` +
          `?apiKey=${encodeURIComponent(firebaseConfig.apiKey || "")}` +
          `&authDomain=${encodeURIComponent(firebaseConfig.authDomain || "")}` +
          `&projectId=${encodeURIComponent(firebaseConfig.projectId || "")}` +
          `&storageBucket=${encodeURIComponent(firebaseConfig.storageBucket || "")}` +
          `&messagingSenderId=${encodeURIComponent(firebaseConfig.messagingSenderId || "")}` +
          `&appId=${encodeURIComponent(firebaseConfig.appId || "")}`;

        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: "/",
        });

        await navigator.serviceWorker.ready;

        // 5. Retrieve device FCM token with VAPID key
        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });

        if (token) {
          console.log("[FCM Initializer] Device push token obtained:", token.substring(0, 25) + "...");
          // Register token to user profile
          await fetch("/api/users/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        }

        // 6. Foreground messaging event listener (Standard browser native notification banner)
        onMessage(messaging, (payload) => {
          console.log("[FCM Initializer] Foreground push received:", payload);

          const title = payload.notification?.title || payload.data?.title || "NextOne Alert";
          const body = payload.notification?.body || payload.data?.body || "";
          const link = payload.data?.click_action || payload.data?.link || "/";
          const icon = payload.data?.icon || "/icon-192.png";

          // Trigger native Windows/Mac browser OS notification banner
          try {
            const notif = new Notification(title, {
              body,
              icon,
            });
            notif.onclick = () => {
              window.focus();
              if (link && link !== "/") window.location.href = link;
            };
          } catch (e) {
            console.warn("[FCM Initializer] Native notification notice:", e);
          }

          // Trigger in-app live floating radar toast & update badge
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("notifications-updated"));
            window.dispatchEvent(
              new CustomEvent("nextone-inapp-alert", {
                detail: { title, body, link, type: payload.data?.type || "general" },
              })
            );
          }
        });

      } catch (err) {
        console.error("[FCM Initializer] Initialization error:", err);
      }
    };

    // Delay registration slightly to prevent layout blocking during initial render
    const delayTimer = setTimeout(() => {
      initFcm();
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, []);

  return null;
}
