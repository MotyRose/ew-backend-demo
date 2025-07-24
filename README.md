# Push Notification System for Embedded Wallet

A demo implementation showcasing push notifications for transaction status updates in Embedded Wallets, replacing the traditional polling-based approach with an efficient push-based model. Each notification is associated with a specific walletId, enabling accurate delivery of transaction updates to the corresponding wallet instance.

## Overview

This backend service enables real-time transaction status notifications across multiple platforms:

- Android (Firebase Cloud Messaging)
- iOS (Apple Push Notification Service)
- Web Browsers (FCM / Web Push API with VAPID)

### Key Benefits

- Eliminates constant polling for transaction status
- Reduces server load and API calls
- Provides immediate status updates
- Supports multiple platforms with a unified API

## Architecture

### Components

1. **Client Applications**

   - Register devices for push notifications
   - Send push tokens to backend during authentication
   - Handle incoming notifications and trigger UI updates

2. **Backend Server**

   - Manages device tokens and subscriptions
   - Processes Fireblocks webhooks
   - Distributes notifications to relevant devices
   - Handles cross-platform notification delivery

3. **Push Services**

   - Firebase Cloud Messaging (FCM) for Android/Web
   - APNs for iOS
   - Web Push API with VAPID for browsers

4. **Fireblocks Integration**
   - Webhook processing for transaction lifecycle events
   - Status change detection and notification triggering

### Workflow

1. **Device Registration**

   ```mermaid
   sequenceDiagram
      Client->>Backend: Register device token
      Backend->>Database: Store token & platform info
      Backend->>Client: Registration confirmed
   ```

2. **Transaction Updates**
   ```mermaid
   sequenceDiagram
      Fireblocks->>Backend: Transaction status webhook
      Backend->>Database: Look up user devices
      Backend->>Push Service: Send notifications
      Push Service->>Client: Deliver notification
   ```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- SQL database
- Firebase project (for FCM)
- VAPID keys (for Web Push)

### Installation

1. Clone the repository

   ```bash
   git clone git@github.com:fireblocks/ew-backend-demo.git
   cd ew-backend-demo
   ```

2. Install dependencies

   ```bash
   yarn install
   ```

3. Configure environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations

   ```bash
   yarn migration:run
   ```

5. Start the server
   ```bash
   yarn dev
   ```

### Configuration

Required environment variables:

```env
##### Server #####
PORT=3000
NODE_ENV=development

##### Database #####
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=db_user
DB_PASSWORD=db_pwd
DB_NAME=ew_demo

##### Authentication #####
JWKS_URI=your-jwks-uri
ISSUER=your-issuer
AUDIENCE=your-audience

##### Fireblocks Webhook Public Key #####
FIREBLOCKS_WEBHOOK_PUBLIC_KEY= "-----BEGIN PUBLIC KEY-----\nMII...""

##### Firebase Service Account #####
FIREBASE_SERVICE_ACCOUNT_PATH=path-to-yor-service-account-file

##### Push Notifications #####
VAPID_SUBJECT=mailto:your-email@example.com
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

##### CORS Origins #####
ORIGIN_WEB_SDK=http://localhost:3000, https://your-domain.com
```

### Firebase Service Account File

The `FIREBASE_SERVICE_ACCOUNT_PATH` environment variable should point to a Firebase service account JSON file. This file is required for the backend to authenticate with Firebase Cloud Messaging (FCM) and send push notifications to Android and web clients.

**How to obtain the service account file:**
1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. Navigate to **Project Settings** (gear icon) > **Service Accounts**.
3. Click **Generate new private key** under the Firebase Admin SDK section.
4. Download the generated JSON file and save it securely (e.g., `firebase-service-account.json`).
5. Set the `FIREBASE_SERVICE_ACCOUNT_PATH` variable in your `.env` file to the path of this JSON file (relative to the project root or as an absolute path).

**Example:**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

**Security Best Practices:**
- **Never commit your service account file to version control.** Add it to your `.gitignore`.
- Store the file securely and restrict access to only trusted team members.
- Rotate the key if you suspect it has been compromised.

## Project Structure

```
src/
├── controllers/      # Request handlers
├── middleware/       # Auth and webhook middleware
├── migrations/       # Database migrations
├── model/            # Database models
├── routes/           # API route definitions
├── services/         # Business logic
├── types/            # TypeScript type definitions
└── util/             # Utility functions

client/
├── examples/
│   ├── react/        # React integration examples
│   └── web/          # Web worker examples
```

## API Endpoints

### Push Notification Registration

```http
POST /api/notifications/register-token
Content-Type: application/json
Authorization: Bearer your-token

{
  "token": "firebase-device-token",
  "platform": "android|ios|web-fcm",
  "walletId": "your-embedded-wallet-id",
  "deviceId": "optional-device-id"
}
```

```http
POST /api/notifications/register-subscription
Content-Type: application/json
Authorization: Bearer your-token

{
  "subscription": {
    "endpoint": "https://push-service.url",
    "keys": {
      "auth": "auth-secret",
      "p256dh": "public-key"
    }
  },
  "walletId": "your-embedded-wallet-id"
}
```

### Web Push Setup

```http
GET /api/notifications/vapid-public-key
```

## Security Considerations

- All endpoints require JWT authentication
- Push tokens are tied to authenticated sessions
- Notification payloads contain minimal data
- Rate limiting prevents abuse
- CORS is configured for allowed origins only
- HTTPS required for web push

## Development

### Running Tests

```bash
yarn test
```

### Code Quality

```bash
yarn lint
yarn format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
