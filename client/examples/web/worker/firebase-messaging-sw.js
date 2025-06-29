/* eslint-env serviceworker */

// Firebase messaging service worker for handling both Firebase Cloud Messaging and Web Push

// TypeScript type definitions for service worker globals
/** @type {ServiceWorkerGlobalScope} */
const sw = self;

sw.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  event.waitUntil(sw.skipWaiting());
});

sw.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(sw.clients.claim());
});

// Handle push events (Web Push)
sw.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  try {
    const data = event.data.json();

    const options = {
      body: data.body || "",
      icon: "/assets/images/logo.png",
      badge: "/assets/images/badge.png",
      vibrate: [100, 50, 100],
      data: {
        ...data.data,
        clickTarget: data.clickTarget || "/",
      },
      actions: data.actions || [],
      // Prevent duplicate notifications
      tag: data.tag || "default",
      // Auto-close after 5 minutes if not interacted with
      requireInteraction: false,
      silent: false,
    };

    event.waitUntil(
      sw.registration.showNotification(
        data.title || "New Notification",
        options,
      ),
    );
  } catch (error) {
    console.error("Error handling push event:", error);
    // Show a generic notification if parsing fails
    event.waitUntil(
      sw.registration.showNotification("New Notification", {
        body: "You have a new notification",
        icon: "/assets/images/logo.png",
      }),
    );
  }
});

// Handle notification clicks
sw.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickTarget = event.notification.data?.clickTarget || "/";

  event.waitUntil(
    sw.clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if (client.navigate) {
            return client.navigate(clickTarget);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(clickTarget);
      }
    }),
  );
});

// Handle Firebase Cloud Messaging
try {
  importScripts(
    "https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js",
  );

  const firebaseConfig = {
    // Firebase config will be injected by the build process
    // or loaded from a separate config file
  };

  if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
    throw new Error("Firebase configuration is missing");
  }

  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("Received background message:", payload);

    const notificationTitle = payload.notification?.title || "New Message";
    const notificationOptions = {
      body: payload.notification?.body,
      icon: "/assets/images/logo.png",
      badge: "/assets/images/badge.png",
      data: payload.data,
      // Merge options from payload if provided
      ...payload.notification,
    };

    return sw.registration.showNotification(
      notificationTitle,
      notificationOptions,
    );
  });
} catch (error) {
  console.error("Error initializing Firebase:", {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });
}

// Optional: Handle errors
sw.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

sw.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled rejection:", event.reason);
});
