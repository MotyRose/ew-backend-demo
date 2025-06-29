# Push Notifications Service Worker

This service worker implementation handles both Firebase Cloud Messaging (FCM) and Web Push notifications for web applications.

## Features

- Dual support for FCM and Web Push
- Rich notification formatting
- Click handling and navigation
- Error handling
- Automatic notification cleanup
- Background message processing

## Installation

1. Copy `firebase-messaging-sw.js` to your project's public directory
2. Configure Firebase (if using FCM)
3. Set up your build process to inject Firebase config

## Implementation

### Basic Setup

```javascript
// In your web app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/'
  });
}
```

### Notification Structure

The service worker expects notifications in this format:

```javascript
{
  title: "Notification Title",
  body: "Notification message",
  data: {
    clickTarget: "/some/url", // URL to navigate to when clicked
    // Any other custom data
  },
  actions: [], // Optional notification actions
  tag: "notification-id" // For notification grouping
}
```

## Features Explained

1. **Installation Handling**
   - Automatically skips waiting
   - Claims clients for immediate control

2. **Push Event Handling**
   - Processes Web Push messages
   - Shows rich notifications
   - Handles missing or malformed data

3. **Notification Click Handling**
   - Closes notification when clicked
   - Navigates to specified URL
   - Focuses existing window if possible
   - Opens new window if needed

4. **Firebase Cloud Messaging**
   - Handles background messages
   - Processes FCM payloads
   - Shows notifications for FCM messages

5. **Error Handling**
   - Catches and logs service worker errors
   - Provides fallback notification for parsing errors
   - Handles unhandled promise rejections

## Configuration

### Firebase Setup

Update the Firebase library versions and config in the service worker:

```javascript
importScripts(
  "https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js"
);

const firebaseConfig = {
  // Your Firebase config
};
```

### Asset Paths

Update the paths to your notification assets:

```javascript
const options = {
  icon: "/assets/images/logo.png",
  badge: "/assets/images/badge.png"
  // ...
};
```

## Best Practices

1. Keep the service worker file in the root directory for maximum scope
2. Test both FCM and Web Push implementations
3. Handle offline scenarios
4. Provide fallback content for failed notifications
5. Implement proper error logging
