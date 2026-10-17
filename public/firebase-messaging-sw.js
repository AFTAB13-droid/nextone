// Import Firebase Compat scripts for Service Workers (Matches AspireMint Architecture)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Parse Firebase credentials dynamically from register parameters (Vercel & localhost compatible)
const params = new URLSearchParams(self.location.search);
const apiKey = params.get('apiKey');
const authDomain = params.get('authDomain');
const projectId = params.get('projectId');
const storageBucket = params.get('storageBucket');
const messagingSenderId = params.get('messagingSenderId');
const appId = params.get('appId');

if (apiKey && projectId && messagingSenderId) {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Background notifications handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background push notification received:', payload);
    
    // Firebase automatically displays notifications if the payload contains a 'notification' object.
    // If we call showNotification manually here, we will get duplicates.
    if (payload.notification) {
      return;
    }

    const notificationTitle = payload.data?.title || "NextOne Update";
    const notificationOptions = {
      body: payload.data?.body || "",
      icon: payload.data?.icon || '/icon-192.png',
      badge: payload.data?.badge || '/icon-192.png',
      data: {
        click_action: payload.data?.click_action || '/'
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  // Fallback default config if query params omitted
  const defaultFallback = {
    apiKey: "AIzaSyDfSGtaEKv2vOhkzbQuxxyV7I09IaPveQM",
    authDomain: "nextone-bbec6.firebaseapp.com",
    projectId: "nextone-bbec6",
    storageBucket: "nextone-bbec6.firebasestorage.app",
    messagingSenderId: "402039742541",
    appId: "1:402039742541:web:8443fb8a46ac4bc9a77c04",
  };
  try {
    firebase.initializeApp(defaultFallback);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Background push notification received:', payload);
      if (payload.notification) return;
      const notificationTitle = payload.data?.title || "NextOne Update";
      self.registration.showNotification(notificationTitle, {
        body: payload.data?.body || "",
        icon: payload.data?.icon || '/icon-192.png',
        badge: payload.data?.badge || '/icon-192.png',
        data: { click_action: payload.data?.click_action || '/' }
      });
    });
  } catch (e) {
    console.warn("[firebase-messaging-sw.js] Fallback initialization notice:", e);
  }
}

// Background click handler to focus tab or navigate
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.click_action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// PWA & Service Worker Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
