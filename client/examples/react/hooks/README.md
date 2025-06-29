# React Push Notifications Hook

`usePushNotifications` is a React hook that provides a unified interface for implementing push notifications in React applications, supporting both Firebase Cloud Messaging (FCM) and Web Push.

## Features

- Support for both FCM and Web Push
- Automatic fallback from FCM to Web Push
- Permission management
- Error handling
- Loading states
- TypeScript support

## Installation

1. Copy the `usePushNotifications.ts` file to your project
2. Install required dependencies:

```bash
npm install firebase web-push @types/web-push
```

## Usage

```typescript
import { usePushNotifications } from './hooks/usePushNotifications';

function App() {
  const {
    isSupported,
    isEnabled,
    isLoading,
    error,
    token,
    enable
  } = usePushNotifications({
    vapidKey: 'YOUR_VAPID_PUBLIC_KEY',
    firebaseConfig: {
      // Your Firebase config
    },
    apiUrl: 'YOUR_API_URL',
    getAccessToken: async () => 'YOUR_AUTH_TOKEN'
  });

  return (
    <div>
      {isSupported && !isEnabled && (
        <button onClick={enable} disabled={isLoading}>
          Enable Push Notifications
        </button>
      )}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## Hook Options

- `vapidKey`: (optional) VAPID public key for Web Push
- `firebaseConfig`: (optional) Firebase configuration object
- `apiUrl`: Backend API URL for registering push subscriptions
- `getAccessToken`: Function that returns a Promise resolving to an authentication token

## Return Value

```typescript
interface UsePushNotificationsResult {
  isSupported: boolean;      // Whether push notifications are supported
  isEnabled: boolean;        // Whether notifications are enabled
  isLoading: boolean;        // Loading state
  error: Error | null;       // Error state
  token: string | null;      // FCM token (if using Firebase)
  enable: () => Promise<void>; // Function to enable notifications
}
```

## Implementation Notes

1. The hook will attempt to use Firebase Cloud Messaging first if `firebaseConfig` is provided
2. If FCM fails or isn't configured, it will fall back to Web Push
3. Service worker registration is handled automatically
4. Subscriptions are automatically registered with your backend
