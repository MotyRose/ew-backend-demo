# Fireblocks EW Client Integration

This directory contains example implementations and documentation for integrating push notifications into client applications.

## Directory Structure

```
client/
├── examples/             # Example implementations
│   ├── react/           # React integration examples
│   │   └── hooks/       # React hooks for push notifications
│   └── web/             # Plain web integration examples
│       └── worker/      # Service worker implementations
```

## Integration Options

1. **React Integration**
   - Uses the `usePushNotifications` hook
   - Supports both Firebase Cloud Messaging and Web Push
   - See `examples/react/hooks/README.md` for implementation details

2. **Web Integration**
   - Service worker implementation for push notifications
   - Supports both Firebase Cloud Messaging and Web Push
   - See `examples/web/worker/README.md` for implementation details

## Getting Started

1. Choose your integration method (React or plain web)
2. Follow the setup instructions in the respective README
3. Configure your Firebase project (if using FCM) or generate VAPID keys (if using Web Push)
4. Update your backend configuration with the appropriate keys
