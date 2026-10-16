/**
 * NextOne Firebase Cloud Messaging (FCM) Service Worker
 * Handles desktop background Web Push Notifications for Employees, Managers, and Admins.
 */

// Import Firebase scripts inside service worker
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Initialize Firebase in service worker
// The client config will be populated dynamically or via query parameters
const firebaseConfig = {
  apiKey: "PLACEHOLDER_API_KEY",
  authDomain: "PLACEHOLDER_PROJECT_ID.firebaseapp.com",
  projectId: "PLACEHOLDER_PROJECT_ID",
  storageBucket: "PLACEHOLDER_PROJECT_ID.appspot.com",
  messagingSenderId: "PLACEHOLDER_MESSAGING_SENDER_ID",
  appId: "PLACEHOLDER_APP_ID",
};

// Check if valid config is present before initializeApp
try {
  if (firebaseConfig.projectId !== "PLACEHOLDER_PROJECT_ID") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log("[firebase-messaging-sw.js] Received background message:", payload);

      const notificationTitle = payload.notification?.title || payload.data?.title || "NextOne Alert";
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || "You have a new update in NextOne.",
        icon: payload.notification?.icon || payload.data?.icon || "/favicon.svg",
        badge: "/favicon.svg",
        data: payload.data || {},
        tag: payload.data?.tag || "nextone-notification",
        requireInteraction: true, // Keep notification on desktop until user dismisses or clicks
        vibrate: [200, 100, 200],
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (e) {
  console.warn("[firebase-messaging-sw.js] Firebase background initialization:", e);
}

// Fallback native push event listener (works even if Firebase config is still in onboarding)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.notification?.title || data.title || "NextOne Alert";
    const body = data.notification?.body || data.body || "You have a new operational notice.";
    const link = data.data?.link || data.link || "/";
    const icon = data.icon || "/favicon.svg";

    const options = {
      body,
      icon,
      badge: "/favicon.svg",
      data: { link, ...data.data },
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("NextOne Alert", {
        body: text,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        requireInteraction: true,
      })
    );
  }
});

// Click listener: focus existing window or open new tab to the target link
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
