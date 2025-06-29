/**
 * NOTE: This is an example hook meant to be copied into a React project.
 * Your project must have the following dependencies installed:
 * - react
 * - firebase
 * - web-push
 * - @types/react
 * - @types/web-push
 */
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken as getMessagingToken,
} from "firebase/messaging";
import { useCallback, useEffect, useState } from "react";
import type { PushSubscription as WebPushSubscription } from "web-push";

interface UsePushNotificationsOptions {
  vapidKey?: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    messagingSenderId: string;
    appId: string;
  };
  apiUrl: string;
  getAccessToken: () => Promise<string>;
}

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  token: string | null;
  error: Error | null;
  isLoading: boolean;
}

interface UsePushNotificationsResult extends PushNotificationState {
  enable: () => Promise<void>;
}

// Helper function to convert browser PushSubscription to web-push PushSubscription
function convertSubscription(
  subscription: PushSubscription,
): WebPushSubscription {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(
        String.fromCharCode(
          ...new Uint8Array(subscription.getKey("p256dh") || new Uint8Array()),
        ),
      ),
      auth: btoa(
        String.fromCharCode(
          ...new Uint8Array(subscription.getKey("auth") || new Uint8Array()),
        ),
      ),
    },
  };
}

export function usePushNotifications({
  vapidKey,
  firebaseConfig,
  apiUrl,
  getAccessToken,
}: UsePushNotificationsOptions): UsePushNotificationsResult {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    token: null,
    error: null,
    isLoading: true,
  });

  // Check if push notifications are supported
  const checkSupport = useCallback((): boolean => {
    // Check if the browser supports these Web APIs
    const hasNotification = typeof Notification !== "undefined";
    const hasServiceWorker = "serviceWorker" in navigator;
    const hasPushManager = "PushManager" in window;

    const isSupported = hasNotification && hasServiceWorker && hasPushManager;
    setState((prev) => ({ ...prev, isSupported }));
    return isSupported;
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setState((prev: PushNotificationState) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
      return false;
    }
  }, []);

  // Initialize Firebase messaging
  const initializeFirebase = useCallback(async (): Promise<string | null> => {
    if (!firebaseConfig) return null;

    try {
      let app: FirebaseApp;
      const existingApps = getApps();

      if (!existingApps.length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = existingApps[0];
      }

      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error("Notification permission not granted");
      }

      const token = await getMessagingToken(messaging, { vapidKey });
      return token;
    } catch (error) {
      console.error(
        "Error initializing Firebase - check your configuration:",
        error,
      );
      throw error;
    }
  }, [firebaseConfig, vapidKey]);

  // Initialize Web Push
  const initializeWebPush =
    useCallback(async (): Promise<PushSubscription | null> => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
        return subscription;
      } catch (error) {
        console.error(
          "Error initializing Web Push - check service worker and VAPID key:",
          error,
        );
        throw error;
      }
    }, [vapidKey]);

  // Register push subscription with backend
  const registerToken = useCallback(
    async (token: string): Promise<void> => {
      const accessToken = await getAccessToken();
      await fetch(`${apiUrl}/notifications/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          token,
          platform: "web-fcm",
        }),
      });
    },
    [apiUrl, getAccessToken],
  );

  const registerSubscription = useCallback(
    async (browserSubscription: PushSubscription): Promise<void> => {
      const accessToken = await getAccessToken();
      const subscription = convertSubscription(browserSubscription);
      await fetch(`${apiUrl}/notifications/register-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ subscription }),
      });
    },
    [apiUrl, getAccessToken],
  );

  const registerWithBackend = useCallback(
    async (
      token: string | null,
      browserSubscription: PushSubscription | null,
    ): Promise<boolean> => {
      try {
        if (token) {
          await registerToken(token);
        }
        if (browserSubscription) {
          await registerSubscription(browserSubscription);
        }
        return true;
      } catch (error) {
        console.error("Error registering with notification service:", error);
        return false;
      }
    },
    [registerToken, registerSubscription],
  );

  // Enable push notifications
  const enable = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const isSupported = await checkSupport();
      if (!isSupported) {
        throw new Error("Push notifications are not supported");
      }

      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        throw new Error("Notification permission denied");
      }

      let token = null;
      let subscription = null;

      if (firebaseConfig) {
        token = await initializeFirebase();
      }

      if (!token && vapidKey) {
        subscription = await initializeWebPush();
      }

      if (!token && !subscription) {
        throw new Error("Failed to initialize push notifications");
      }

      const registered = await registerWithBackend(token, subscription);
      if (!registered) {
        throw new Error("Failed to register with backend");
      }

      setState((prev) => ({
        ...prev,
        isEnabled: true,
        token: token || null,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      }));
    }
  }, [
    checkSupport,
    requestPermission,
    initializeFirebase,
    initializeWebPush,
    registerWithBackend,
    firebaseConfig,
    vapidKey,
  ]);

  // Initialize on mount
  useEffect(() => {
    checkSupport();
    setState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, [checkSupport]);

  return {
    ...state,
    enable,
  };
}
