# Deployment Guide

This guide helps you choose the best deployment platform for the Fireblocks push notification service and provides links to detailed platform-specific instructions.

## Quick Platform Comparison

| Platform | Database | Free Tier | Best For | Deployment Guide |
|----------|----------|-----------|----------|------------------|
| **Railway** | MySQL | 500h/month | Quick setup, MySQL preference | [DEPLOYMENT-RAILWAY.md](./DEPLOYMENT-RAILWAY.md) |
| **Render** | PostgreSQL | 90-day trial | Modern stack, PostgreSQL preference | [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md) |

## Choosing Your Platform

### 🚂 Railway (MySQL)
**Choose Railway if you:**
- Want the fastest setup with minimal configuration
- Prefer MySQL database
- Need integrated database + hosting solution
- Want automatic MySQL plugin integration

**Key Features:**
- Automatic MySQL database provisioning
- Zero-configuration deployment from GitHub
- Built-in environment variable management
- Free 500 hours/month execution time

### 🎨 Render (PostgreSQL)
**Choose Render if you:**
- Prefer PostgreSQL for advanced features
- Want a modern, developer-friendly platform
- Need robust free tier for testing
- Plan to use advanced PostgreSQL features

**Key Features:**
- Managed PostgreSQL with automatic SSL
- 90-day free database trial
- Advanced PostgreSQL features (native UUID, JSON, etc.)
- Automatic SSL certificate provisioning

## Database Type Configuration

The application supports both MySQL and PostgreSQL through the `DB_TYPE` environment variable:

### For MySQL (Railway, PlanetScale)
```bash
DB_TYPE=mysql
DB_SSL=false  # Usually not required for MySQL
```

### For PostgreSQL (Render, Supabase)
```bash
DB_TYPE=postgres
DB_SSL=true   # Required for cloud PostgreSQL
```

## Environment File Templates

Choose the appropriate environment template for your deployment:

### Cloud Deployment Templates
- **Railway MySQL**: Use `.env.railway` template
- **Render PostgreSQL**: Use `.env.render` template  
- **PlanetScale MySQL**: Use `.env.planetscale` template
- **External PostgreSQL**: Use `.env.postgres` template

### Local Development Templates
- **Docker PostgreSQL**: Use `.env.docker.postgres` template
- **Docker MySQL**: Use `.env.docker` template

## Common Environment Variables

All deployment platforms require these core variables:

### Database Configuration
```bash
DB_TYPE=mysql          # or "postgres"
DB_SSL=false          # or "true" for PostgreSQL cloud providers
# Database connection details (varies by platform)
```

### Authentication
```bash
JWKS_URI=https://your-auth-provider.com/.well-known/jwks.json
ISSUER=https://your-auth-provider.com/
AUDIENCE=your-audience-identifier
```

### Firebase Service Account
```bash
# Paste complete JSON content
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### Push Notifications (VAPID Keys)
```bash
VAPID_SUBJECT=mailto:your-email@fireblocks.com
VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY_HERE
VAPID_PRIVATE_KEY=YOUR_VAPID_PRIVATE_KEY_HERE
```

### Fireblocks Webhook
```bash
# Choose sandbox or production key
FIREBLOCKS_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
```

### CORS Configuration
```bash
ORIGIN_WEB_SDK=https://your-frontend-domain.com
```

## Pre-Deployment Setup

Before deploying to any platform:

1. **Generate VAPID Keys**
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Get Firebase Service Account**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the JSON content for `FIREBASE_SERVICE_ACCOUNT_JSON`

3. **Prepare Authentication Details**
   - Get your JWKS URI from your authentication provider
   - Note your JWT issuer and audience values

4. **Choose Fireblocks Environment**
   - Use sandbox key for development/testing
   - Use production key for production deployment

## Deployment Steps

### Quick Start (Railway - MySQL)
1. Follow [DEPLOYMENT-RAILWAY.md](./DEPLOYMENT-RAILWAY.md)
2. Use `.env.railway` template
3. Set `DB_TYPE=mysql`
4. Deploy with Railway MySQL plugin

### Quick Start (Render - PostgreSQL)  
1. Follow [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md)
2. Use `.env.render` template
3. Set `DB_TYPE=postgres`
4. Deploy with Render PostgreSQL database

## Database Migration Notes

### From MySQL to PostgreSQL
If switching from MySQL to PostgreSQL:
1. Export your MySQL data
2. Convert schema using migration tools
3. Update `DB_TYPE=postgres` and `DB_SSL=true`
4. The TypeORM migration automatically handles database differences

### From PostgreSQL to MySQL
If switching from PostgreSQL to MySQL:
1. Export your PostgreSQL data
2. Convert schema and data types
3. Update `DB_TYPE=mysql` and `DB_SSL=false`
4. The TypeORM migration automatically adapts

## Troubleshooting

### Common Issues
- **Migration Errors**: Ensure `DB_TYPE` matches your actual database
- **Connection Issues**: Verify SSL settings match your database provider
- **Build Failures**: Check Node.js version (requires >=20)
- **Environment Variables**: Ensure no trailing spaces in values

### Platform-Specific Issues
- **Railway**: See [DEPLOYMENT-RAILWAY.md](./DEPLOYMENT-RAILWAY.md#troubleshooting)
- **Render**: See [DEPLOYMENT-RENDER.md](./DEPLOYMENT-RENDER.md#troubleshooting)

## Next Steps

After successful deployment:

1. **Test Deployment**
   ```bash
   curl https://your-app-url.com/
   curl https://your-app-url.com/api/notifications/vapid-public-key
   ```

2. **Configure Frontend**
   - Update API endpoints to your deployed URL
   - Test push notification registration
   - Verify CORS origins are configured correctly

3. **Production Hardening**
   - Review all environment variables
   - Configure appropriate logging levels
   - Set up monitoring and alerts
   - Plan for scaling and backups

## Additional Resources

- **Database Comparison**: [DATABASE-COMPARISON.md](./DATABASE-COMPARISON.md)
- **Development Setup**: [CLAUDE.md](./CLAUDE.md)
- **Local Docker Setup**: [CLAUDE.md#local-docker-development](./CLAUDE.md#local-docker-development)
- **Environment Templates**: All `.env.*` files in the repository

## Support

For deployment-specific issues:
- **Railway**: Railway community Discord or support
- **Render**: Render community Discord or documentation
- **General**: Check GitHub issues or create new issue