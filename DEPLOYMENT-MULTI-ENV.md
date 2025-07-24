# Multi-Environment Deployment Guide for Render.com

This guide explains how to deploy the Fireblocks Embedded Wallets push notification service across three environments: Development, Sandbox, and Production using Render.com Blueprint configuration.

## Overview

The multi-environment setup provides:
- **3 separate services**: `ew-demo-dev`, `ew-demo-sandbox`, `ew-demo-prod`
- **3 separate databases**: `ew-demo-dev-db`, `ew-demo-sandbox-db`, `ew-demo-prod-db`
- **3 environment variable groups**: `fireblocks-dev-env`, `fireblocks-sandbox-env`, `fireblocks-prod-env`
- **Isolated configurations**: Separate API keys, CORS origins, and security settings
- **Different deployment strategies**: Auto-deploy for dev/sandbox, manual for production

## Environment Strategy

### Development Environment
- **Branch**: `dev`
- **Auto-deploy**: Enabled for rapid iteration
- **Log Level**: `debug` for detailed debugging
- **Firebase**: Development project with test data
- **Fireblocks**: Sandbox API keys for testing
- **CORS**: Includes localhost for local development

### Sandbox Environment
- **Branch**: `main`
- **Auto-deploy**: Enabled for staging validation
- **Log Level**: `info` for balanced logging
- **Firebase**: Staging project mirroring production setup
- **Fireblocks**: Sandbox API keys for integration testing
- **CORS**: Staging frontend domains

### Production Environment
- **Branch**: `main`
- **Auto-deploy**: Disabled for controlled releases
- **Log Level**: `warn` for minimal logging
- **Firebase**: Production project with real user data
- **Fireblocks**: Production API keys for live transactions
- **CORS**: Production frontend domains only

## Step-by-Step Setup

### Prerequisites
1. GitHub repository with `dev` and `main` branches
2. Render.com account
3. Three sets of Firebase service account JSON files (dev, sandbox, prod)
4. Three sets of VAPID keys for Web Push
5. Fireblocks webhook public keys (sandbox and production)

### Step 1: Prepare Environment Variable Templates

The repository includes three environment templates:
- `.env.render.dev` - Development environment variables
- `.env.render.sandbox` - Sandbox environment variables
- `.env.render.prod` - Production environment variables

Review and customize these templates with your actual values.

### Step 2: Deploy Blueprint to Render

1. **Connect Repository**
   - Go to [render.com](https://render.com) and sign in
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` file automatically

2. **Review Services**
   The blueprint will create:
   - `ew-demo-dev` (free plan, auto-deploy from dev)
   - `ew-demo-sandbox` (starter plan, auto-deploy from main)
   - `ew-demo-prod` (starter plan, manual deploy from main)

3. **Review Databases**
   The blueprint will create:
   - `ew-demo-dev-db` (free PostgreSQL)
   - `ew-demo-sandbox-db` (starter PostgreSQL)
   - `ew-demo-prod-db` (starter PostgreSQL, for production reliability)

### Step 3: Create Environment Variable Groups

Render will prompt you to set up the environment variable groups. You'll need to create values for each group:

#### Development Group (`fireblocks-dev-env`)
```bash
# Use values from .env.render.dev template
NODE_ENV=development
LOG_LEVEL=debug
JWKS_URI=https://your-dev-auth-provider.com/.well-known/jwks.json
ISSUER=https://your-dev-auth-provider.com/
AUDIENCE=your-dev-audience-identifier
FIREBLOCKS_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n[Sandbox Key]\n-----END PUBLIC KEY-----"
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...} # Dev project JSON
VAPID_SUBJECT=mailto:dev@fireblocks.com
VAPID_PUBLIC_KEY=YOUR_DEV_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY=YOUR_DEV_VAPID_PRIVATE_KEY
ORIGIN_WEB_SDK=http://localhost:3000,http://localhost:3001,https://your-dev-frontend.onrender.com
```

#### Sandbox Group (`fireblocks-sandbox-env`)
```bash
# Use values from .env.render.sandbox template
NODE_ENV=staging
LOG_LEVEL=info
# ... similar structure with sandbox-specific values
```

#### Production Group (`fireblocks-prod-env`)
```bash
# Use values from .env.render.prod template
NODE_ENV=production
LOG_LEVEL=warn
FIREBLOCKS_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n[Production Key]\n-----END PUBLIC KEY-----"
# ... production-specific values
```

### Step 4: Environment-Specific Configuration

#### Firebase Service Accounts
- **Development**: Use a separate Firebase project for testing
- **Sandbox**: Use a staging Firebase project that mirrors production
- **Production**: Use your live Firebase project with production users

#### VAPID Keys
Generate separate VAPID key pairs for each environment:
```bash
# Generate keys for each environment
npx web-push generate-vapid-keys  # Development
npx web-push generate-vapid-keys  # Sandbox
npx web-push generate-vapid-keys  # Production
```

#### Fireblocks Configuration
- **Development & Sandbox**: Use Fireblocks sandbox webhook public key
- **Production**: Use Fireblocks production webhook public key

### Step 5: Deploy and Verify

1. **Development**: Pushes to `dev` branch auto-deploy to `ew-demo-dev`
2. **Sandbox**: Pushes to `main` branch auto-deploy to `ew-demo-sandbox`
3. **Production**: Manual deployment required for `ew-demo-prod`

### Step 6: Access Your Environments

After deployment, your services will be available at:
- **Development**: `https://ew-demo-dev.onrender.com`
- **Sandbox**: `https://ew-demo-sandbox.onrender.com`
- **Production**: `https://ew-demo-prod.onrender.com`

## Security Best Practices

### Environment Isolation
- Each environment has completely separate database and credentials
- Environment variable groups prevent cross-environment credential leakage
- Production uses manual deployment to prevent accidental releases

### Credential Management
- Never commit actual credentials to version control
- Use different API keys and certificates for each environment
- Rotate production credentials regularly

### Database Security
- Production database uses paid plan for better reliability and backups
- All databases use SSL connections (`DB_SSL=true`)
- Separate database names prevent data contamination

## Monitoring and Maintenance

### Log Management
- **Development**: `debug` level for detailed troubleshooting
- **Sandbox**: `info` level for normal operation monitoring
- **Production**: `warn` level to minimize log volume and focus on issues

### Performance Considerations
- Development and sandbox use free plans for cost efficiency
- Production uses starter plans for better performance and reliability
- Consider upgrading production plans based on usage

### Deployment Strategy
- Use feature branches that merge to `dev` for development testing
- Merge `dev` to `main` for sandbox validation
- Manually deploy `main` to production after sandbox validation

## Troubleshooting

### Common Issues

1. **Environment Variable Not Found**
   - Verify the environment variable group is linked to the service
   - Check that the variable exists in the correct environment group
   - Ensure variable names match exactly (case-sensitive)

2. **Database Connection Errors**
   - Confirm `DATABASE_URL` is correctly linked from the database
   - Verify `DB_SSL=true` for PostgreSQL connections
   - Check database and service are in the same region

3. **Firebase Authentication Errors**
   - Validate Firebase service account JSON is properly formatted
   - Ensure the service account has necessary permissions
   - Verify project ID matches the environment

4. **Push Notification Failures**
   - Confirm VAPID keys are properly generated and configured
   - Check VAPID subject uses correct email format
   - Verify CORS origins include your frontend domains

### Health Checks
All services include health check endpoints at `/` that verify:
- Database connectivity
- Environment configuration
- Service availability

## Cost Optimization

### Free Tier Usage
- Development and sandbox environments use free plans
- Free PostgreSQL databases for non-production environments
- Monitor usage to stay within free tier limits

### Production Scaling
- Production uses starter plans for reliability
- Consider upgrading based on actual usage metrics
- Monitor database performance and upgrade if needed

## Migration from Single Environment

If migrating from a single environment setup:

1. **Backup Current Data**: Export existing database if needed
2. **Update Branches**: Ensure `dev` and `main` branches exist
3. **Deploy Blueprint**: Follow the setup steps above
4. **Migrate Data**: Import data to appropriate environment databases
5. **Update Client Configuration**: Point clients to correct environment URLs
6. **Test Each Environment**: Verify functionality across all environments

This multi-environment setup provides robust isolation, security, and deployment control for your push notification service while maintaining cost efficiency for non-production environments.
