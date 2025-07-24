# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a push notification backend service for Fireblocks Embedded Wallets that replaces polling-based transaction status checks with real-time push notifications. The system handles notifications across Android (FCM), iOS (APNs), and Web (Web Push API with VAPID) platforms. Each notification is associated with a specific walletId, enabling accurate delivery of transaction updates to the corresponding wallet instance.

## Architecture

### Core Components
- **Express.js backend** with TypeScript and ES modules
- **TypeORM** for database operations with MySQL
- **JWT authentication** using JWKS for API endpoints
- **Push notification services**: Firebase Admin SDK, Web Push API
- **Webhook processing** for Fireblocks transaction status updates
- **Rate limiting** with express-rate-limit (excludes webhooks)
- **Security headers** via Helmet
- **Request/response logging** with structured error handling

### Key Directories
- `src/controllers/` - Request handlers for notifications and webhooks (BaseController for common functionality)
- `src/middleware/` - JWT auth and webhook signature verification
- `src/model/` - TypeORM entities (DeviceToken, WebPushSubscription)
- `src/routes/` - Express route definitions
- `src/services/` - Business logic for notification delivery
- `src/migrations/` - Database schema migrations
- `src/types/` - TypeScript type definitions including Fireblocks types
- `src/util/` - Utilities (env.ts, fetch-all.ts, logger.ts)
- `client/examples/` - Client-side integration examples with React hooks and Web workers

### Database Design
- **DeviceToken**: Stores FCM tokens for mobile/web devices
- **WebPushSubscription**: Stores Web Push subscriptions for browsers
- All entities link to authenticated users via JWT payload
- Migrations handle schema versioning (currently 1746700230000-CreateTables.ts)

### Client Integration
- **React Hook** (`usePushNotifications`): Unified interface supporting both FCM and Web Push with automatic fallback
- **Service Worker** (`firebase-messaging-sw.js`): Handles both Firebase and Web Push events with rich notification support

## Development Commands

### Setup and Installation
```bash
yarn install                    # Install dependencies
yarn migration:run             # Run database migrations
cp .env.example .env           # Copy environment template
```

### Development
```bash
yarn dev                       # Start development server with nodemon
yarn build                     # Build TypeScript to dist/
yarn start                     # Run migrations then serve built app
yarn serve                     # Serve built app without migrations
```

### Code Quality
```bash
yarn lint                      # Run ESLint on src/**/*.ts
yarn lint:fix                  # Fix ESLint issues automatically
yarn format                    # Format code with Prettier (src/**/*.{ts,tsx})
yarn format:check              # Check formatting without changes
```

### Testing
```bash
yarn test                      # Run Jest tests with coverage, runInBand mode
yarn test:watch               # Run tests in watch mode
yarn test:cov                 # Run tests with coverage report
yarn test:debug               # Run tests with Node.js debugger
```

### Database Operations
```bash
# General (uses DB_TYPE from environment)
yarn migration:generate       # Generate new migration based on entity changes
yarn migration:run           # Run pending migrations
yarn migration:revert        # Revert last migration

# Database-specific operations
yarn migration:generate:mysql     # Generate MySQL-specific migration
yarn migration:generate:postgres  # Generate PostgreSQL-specific migration
yarn migration:run:mysql         # Run migrations with MySQL connection
yarn migration:run:postgres      # Run migrations with PostgreSQL connection
yarn migration:revert:mysql      # Revert migration with MySQL connection
yarn migration:revert:postgres   # Revert migration with PostgreSQL connection

yarn typeorm                  # Access TypeORM CLI directly
```

### Docker Operations

#### MySQL Docker Setup
```bash
make start-mysql-dev           # Start MySQL with phpMyAdmin (recommended)
make start-mysql               # Start MySQL services only
make stop-mysql                # Stop MySQL services
make restart-mysql             # Restart MySQL services
make logs-mysql                # View MySQL logs
make status-mysql              # Check MySQL service status
make clean-mysql               # Stop and remove MySQL volumes
```

#### PostgreSQL Docker Setup
```bash
make start-postgres-dev        # Start PostgreSQL with pgAdmin (recommended)
make start-postgres            # Start PostgreSQL services only
make stop-postgres             # Stop PostgreSQL services
make restart-postgres          # Restart PostgreSQL services
make logs-postgres             # View PostgreSQL logs
make status-postgres           # Check PostgreSQL service status
make clean-postgres            # Stop and remove PostgreSQL volumes
```

#### Legacy Commands (MySQL)
```bash
make start                     # Start MySQL (backward compatibility)
make stop                      # Stop MySQL (backward compatibility)
make restart                   # Restart MySQL (backward compatibility)
make help                      # Show all available commands
```

### Database Diagrams
```bash
yarn db:diagram               # Generate PlantUML diagram with local server
yarn db:diagram:public        # Generate diagram using public PlantUML server
```

## Database Setup

The application supports both **MySQL** and **PostgreSQL** databases (configurable via environment variables). Database entities are defined using TypeORM decorators in `src/model/`. All schema changes must be done through migrations - synchronization is disabled.

### Database Selection

Set the `DB_TYPE` environment variable to choose your database:
- `DB_TYPE=mysql` (default for backward compatibility)
- `DB_TYPE=postgres` (for PostgreSQL)

### MySQL Setup (Default)
```bash
# Using default MySQL configuration
cp .env.example .env
# Edit .env with your MySQL connection details
yarn migration:run
```

### PostgreSQL Setup
```bash
# Using PostgreSQL template
cp .env.postgres .env
# Edit .env with your PostgreSQL connection details
yarn migration:run
```

### Local Docker Development

#### Quick Start with PostgreSQL (Recommended)
```bash
# 1. Copy PostgreSQL Docker environment
cp .env.docker.postgres .env

# 2. Start PostgreSQL with pgAdmin
make start-postgres-dev

# 3. Run migrations
yarn migration:run

# 4. Start development server
yarn dev
```

**Access Points:**
- **Application**: http://localhost:3000
- **pgAdmin**: http://localhost:8080 (admin@fireblocks.com / admin_password)
- **PostgreSQL**: localhost:5432 (fireblocks_user / fireblocks_password)
- **Redis**: localhost:6379 (optional caching)

#### Quick Start with MySQL
```bash
# 1. Copy MySQL Docker environment  
cp .env.docker .env

# 2. Start MySQL with phpMyAdmin
make start-mysql-dev

# 3. Run migrations
yarn migration:run

# 4. Start development server
yarn dev
```

**Access Points:**
- **Application**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
- **MySQL**: localhost:3306 (fireblocks_user / fireblocks_password)

The unified migration automatically handles database-specific differences:
- **UUID Types**: PostgreSQL uses native `uuid`, MySQL uses `varchar(36)`
- **Timestamps**: PostgreSQL uses `NOW()`, MySQL uses `CURRENT_TIMESTAMP`
- **Auto-Update**: PostgreSQL uses triggers, MySQL uses `ON UPDATE CURRENT_TIMESTAMP`
- **Enums**: PostgreSQL requires explicit enum names

## Authentication & Security

- All `/api/notifications/*` endpoints require JWT authentication
- JWT verification uses JWKS from configured provider
- Webhook endpoints use Fireblocks signature verification
- Rate limiting applied to all API routes except webhooks
- CORS configuration currently commented out in `src/app.ts:30-46`

## Push Notification Flow

1. Clients register device tokens/subscriptions via `/api/notifications/register-*` endpoints
2. Fireblocks webhooks trigger transaction status updates
3. Backend queries for relevant user devices and sends platform-specific notifications
4. Firebase Admin SDK handles FCM delivery, web-push library handles Web Push

## Environment Configuration

Key environment variables (see .env.example for full template):
- **Server**: `NODE_ENV`, `PORT`, `LOG_LEVEL`
- **Database**: `DB_TYPE` (mysql|postgres), `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` (postgres only)
- **JWT Auth**: `JWKS_URI`, `ISSUER`, `AUDIENCE`
- **Firebase**: `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH`
- **Web Push**: `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- **Fireblocks**: `FIREBLOCKS_WEBHOOK_PUBLIC_KEY` (different keys for sandbox vs production)
- **CORS**: `ORIGIN_WEB_SDK` (comma-separated list of allowed origins)

### VAPID Key Generation
Generate VAPID keys for Web Push using:
```bash
npx web-push generate-vapid-keys
# Or via Firebase CLI: firebase messaging:generate-vapid-key
```

### Firebase Service Account
The Firebase service account is required for FCM. You can provide it in two ways:
1. **JSON Environment Variable** (recommended for cloud deployment): Set `FIREBASE_SERVICE_ACCOUNT_JSON` with the complete JSON content
2. **File Path** (for local development): Set `FIREBASE_SERVICE_ACCOUNT_PATH` to point to the JSON file

Download from Firebase Console > Project Settings > Service Accounts > Generate new private key. **Never commit the JSON file to version control.**

### Database Type Selection
The `DB_TYPE` environment variable determines which database the application uses:
- `DB_TYPE=mysql` - Use MySQL (Railway, PlanetScale, Docker MySQL)
- `DB_TYPE=postgres` - Use PostgreSQL (Render, Supabase, Docker PostgreSQL)

The application automatically adapts its configuration, migrations, and data types based on this setting.

## API Endpoints

### Push Notification Registration
- `POST /api/notifications/register-token` - Register FCM/mobile device tokens
- `POST /api/notifications/register-subscription` - Register Web Push subscriptions  
- `GET /api/notifications/vapid-public-key` - Get VAPID public key for client use

### Webhooks
- `POST /api/webhook/*` - Fireblocks webhook endpoints with signature verification

## Testing Strategy

Jest configuration uses ts-jest preset with:
- Tests must be named `*.spec.ts` in `src/` directory
- Coverage reports in multiple formats (json, cobertura, lcov, text)
- `runInBand` mode for database tests
- `detectOpenHandles` and `forceExit` for cleanup

## Code Quality Tools

- **ESLint**: Multi-config setup for backend TypeScript, client React, and service workers
- **Prettier**: Consistent formatting with lint-staged pre-commit hooks
- **Husky**: Git hooks for automated formatting and linting
- **TypeScript**: Strict mode enabled with ES2020 target

## Deployment

### Railway Deployment (Recommended Free Option)

Railway provides the best free hosting solution for this push notification service with built-in MySQL database support.

#### Prerequisites
1. GitHub/GitLab account with your repository
2. Railway account (sign up at railway.app)
3. Firebase service account JSON file
4. Generated VAPID keys for Web Push

#### Step-by-Step Deployment

**1. Initial Setup**
```bash
# Generate VAPID keys locally
npx web-push generate-vapid-keys

# Note down the output for environment variables
```

**2. Railway Project Setup**
- Go to [railway.app](https://railway.app) and sign in with GitHub
- Click "New Project" → "Deploy from GitHub repo"
- Select your `fireblocks-ew-backend-demo` repository
- Railway will automatically detect it's a Node.js project

**3. Add MySQL Database**
- In your Railway project dashboard, click "New Service"
- Select "Database" → "Add MySQL"
- Railway will automatically create database connection variables

**4. Environment Variables Configuration**
Copy variables from `.env.railway` template to Railway dashboard:
- Go to your service → "Variables" tab
- Add each environment variable from the template
- Replace placeholder values with your actual configuration:
  - JWT authentication details (`JWKS_URI`, `ISSUER`, `AUDIENCE`)
  - VAPID keys from step 1
  - Fireblocks webhook public key (sandbox or production)
  - CORS origins for your frontend domains

**5. Firebase Service Account**
- Add Firebase service account JSON as environment variable:
  - Download JSON from Firebase Console → Project Settings → Service Accounts → Generate new private key
  - Copy the entire JSON file content
  - In Railway dashboard → Variables tab → Add `FIREBASE_SERVICE_ACCOUNT_JSON`
  - Paste the complete JSON content as the variable value

**6. Deploy**
- Push any commit to your main branch
- Railway automatically builds and deploys
- Monitor deployment in Railway dashboard logs
- Your app will be available at `https://your-project-name.railway.app`

#### Production Configuration

**Custom Domain Setup**
1. In Railway dashboard, go to "Settings" → "Domains"
2. Add your custom domain (if purchased) or use the Railway subdomain
3. Configure DNS records as shown in Railway dashboard
4. SSL certificates are automatically provisioned

**Environment Optimization**
- Set `NODE_ENV=production`
- Configure appropriate `LOG_LEVEL` (info or warn for production)
- Update `ORIGIN_WEB_SDK` with your actual frontend domains

#### Monitoring and Maintenance

**Health Checks**
- Railway automatically monitors the `/` health endpoint
- Check application logs in Railway dashboard
- Monitor database connections and performance

**Scaling**
- Railway free tier provides 500 hours/month
- Upgrade to paid plan for higher limits and always-on service
- Database automatically scales with usage

**Troubleshooting**
- Check build logs if deployment fails
- Verify all environment variables are set correctly
- Ensure Firebase service account file is uploaded
- Test database connectivity using Railway's built-in tools

### Render.com Deployment (Alternative Free Option)

Render.com offers another free hosting solution with support for multiple database providers, making it a flexible alternative to Railway.

#### Prerequisites
1. GitHub account with your repository
2. Render account (sign up at render.com)
3. Firebase service account JSON file
4. Generated VAPID keys for Web Push
5. Database provider account (PlanetScale recommended)

#### Step-by-Step Deployment

**1. Database Setup (Choose One)**

*Option A: Render PostgreSQL (Recommended Free Option)*
- Available during Render service creation
- Automatically provides `DATABASE_URL`
- 90-day free tier with generous limits
- No additional setup required

*Option B: PlanetScale MySQL (Production Alternative)*
- Sign up at [planetscale.com](https://planetscale.com)
- Create new database: `fireblocks-push-notifications`
- Generate connection credentials
- Requires setting `DB_TYPE=mysql` in environment variables

*Option C: Self-hosted MySQL Docker*
- Set up your own VPS with Docker
- Use `.env.docker` template for configuration
- Requires setting `DB_TYPE=mysql` in environment variables
- Provides full control but requires maintenance

**2. Render Service Creation**
- Go to [render.com](https://render.com) and sign in with GitHub
- Click "New" → "Web Service"
- Connect your `fireblocks-ew-backend-demo` repository
- Configure build settings:
  - Build Command: `yarn install && yarn build`
  - Start Command: `yarn start`
  - Runtime: Node.js

**3. Environment Variables**
Use the `.env.render` template and set variables in Render dashboard:
- Go to service "Environment" tab
- Add all required environment variables
- For PostgreSQL (default): `DB_TYPE=postgres`, use auto-provided `DATABASE_URL`
- For PlanetScale: Set `DB_TYPE=mysql` and `DATABASE_URL` with your connection string

**4. Firebase Configuration**
- Add `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable
- Paste complete JSON content from Firebase Console

**5. Deploy and Monitor**
- Render automatically builds and deploys on git push
- Monitor deployment logs in Render dashboard
- Service available at `https://your-service-name.onrender.com`

#### Database Comparison

See `DATABASE-COMPARISON.md` for detailed comparison of database options:

| Option | Cost | Maintenance | Best For |
|--------|------|-------------|----------|
| Railway MySQL | Free (500h/month) | Managed | Quick deployment |
| PlanetScale | Free (5GB) | Managed | Production apps |
| Self-hosted Docker | Hardware costs | Self-managed | Custom requirements |
| Render PostgreSQL | Free (90 days) | Managed | Temporary projects |

#### Configuration Files

The repository includes comprehensive configuration templates:
- `render.yaml` - Render service configuration (PostgreSQL default)
- `.env.render` - Multiple database options with PostgreSQL as default
- `.env.postgres` - PostgreSQL-specific configuration template
- `.env.planetscale` - PlanetScale MySQL setup
- `.env.docker` - Self-hosted MySQL configuration
- `.env.docker.postgres` - Docker PostgreSQL with pgAdmin and Redis
- `DATABASE-COMPARISON.md` - Detailed database comparison including PostgreSQL

#### Deployment Guides
- `DEPLOYMENT.md` - Unified deployment guide with platform comparison
- `DEPLOYMENT-RAILWAY.md` - Railway-specific deployment with MySQL
- `DEPLOYMENT-RENDER.md` - Render-specific deployment with PostgreSQL

### Alternative Free Hosting Options

**Option 3: Vercel + Supabase**
- Serverless hosting on Vercel
- PostgreSQL database on Supabase (requires minor TypeORM config changes)
- Best for applications with predictable traffic patterns