/**
 * NextOne Firebase Cloud Messaging (FCM) Service Worker
 * Handles desktop background Web Push Notifications for Employees, Managers, and Admins.
 */

// 1. Service Worker Lifecycle: Activate immediately on update
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// 2. Import Firebase scripts inside service worker
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// 3. Initialize Firebase in service worker with valid NextOne credentials
const firebaseConfig = {
  apiKey: "AIzaSyDfSGtaEKv2vOhkzbQuxxyV7I09IaPveQM",
  authDomain: "nextone-bbec6.firebaseapp.com",
  projectId: "nextone-bbec6",
  storageBucket: "nextone-bbec6.firebasestorage.app",
  messagingSenderId: "402039742541",
  appId: "1:402039742541:web:8443fb8a46ac4bc9a77c04",
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Background push received:", payload);

    const title = payload.notification?.title || payload.data?.title || "NextOne Alert";
    const body = payload.notification?.body || payload.data?.body || "You have a new update in NextOne.";
    const link = payload.data?.link || payload.notification?.click_action || "/";
    const icon = payload.notification?.icon || payload.data?.icon || "/icon-192.png";

    const iconUrl = self.location.origin + "/icon-192.png";

    const notificationOptions = {
      body,
      icon: iconUrl, // Must be raster PNG with full absolute URL for Windows Action Center
      badge: iconUrl,
      data: { link, ...payload.data },
      tag: payload.data?.tag || "nextone-desktop-alert",
      requireInteraction: true, // Keep notification visible on desktop until dismissed or clicked
      vibrate: [200, 100, 200],
    };

    return self.registration.showNotification(title, notificationOptions);
  });
} catch (e) {
  console.warn("[firebase-messaging-sw.js] Firebase background initialization:", e);
}

// 4. Click listener: focus existing window or open new tab to the target link
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.link || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If no window is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
