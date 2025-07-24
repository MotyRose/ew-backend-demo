# Deployment Guide - Render.com

This guide provides step-by-step instructions for deploying the Fireblocks push notification service to Render.com with PostgreSQL database.

## Quick Start

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/fireblocks/ew-backend-demo.git
   cd ew-backend-demo
   ```

2. **Generate VAPID Keys**
   ```bash
   npx web-push generate-vapid-keys
   ```
   Save the output - you'll need both keys for environment variables.

3. **Render Setup**
   - Go to [render.com](https://render.com)
   - Sign up/in with GitHub
   - Click "New" → "Web Service"
   - Connect your repository

4. **Add PostgreSQL Database**
   - In Render dashboard: "New" → "PostgreSQL"
   - Choose free plan (90-day trial)
   - Database will be automatically linked to your web service

5. **Environment Variables**
   - Copy from `.env.render` template
   - Replace all placeholder values with your actual configuration
   - Paste Firebase service account JSON content as environment variable

6. **Deploy**
   - Push to main branch triggers automatic deployment
   - Monitor deployment logs in Render dashboard

## Environment Variables Checklist

### Required Variables
- [ ] `DB_TYPE` - Set to "postgres" for PostgreSQL
- [ ] `DATABASE_URL` - Automatically provided by Render PostgreSQL service
- [ ] `DB_SSL` - Set to "true" for Render PostgreSQL
- [ ] `JWKS_URI` - Your JWT authentication provider's JWKS endpoint
- [ ] `ISSUER` - JWT token issuer
- [ ] `AUDIENCE` - JWT token audience
- [ ] `FIREBLOCKS_WEBHOOK_PUBLIC_KEY` - Fireblocks webhook verification key
- [ ] `VAPID_PUBLIC_KEY` - Generated Web Push public key
- [ ] `VAPID_PRIVATE_KEY` - Generated Web Push private key
- [ ] `VAPID_SUBJECT` - Your contact email for Web Push
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` - Complete Firebase service account JSON content

### Auto-Generated (Render PostgreSQL)
- [ ] `DATABASE_URL` - Complete PostgreSQL connection string
- [ ] `PORT` - Application port (automatically set by Render)

### Optional
- [ ] `ORIGIN_WEB_SDK` - CORS origins for your frontend
- [ ] `LOG_LEVEL` - Logging level (default: info)

## Database Options

### Option 1: Render PostgreSQL (Recommended)
**Pros:**
- Integrated with web service
- Automatic `DATABASE_URL` setup
- 90-day free trial
- Built-in SSL security
- Automatic backups

**Setup:**
1. Create PostgreSQL database in Render dashboard
2. Set `DB_TYPE=postgres` in environment variables
3. Set `DB_SSL=true` for secure connections
4. `DATABASE_URL` is automatically provided

### Option 2: External PostgreSQL (PlanetScale, Supabase)
**For PlanetScale MySQL:**
1. Set `DB_TYPE=mysql` 
2. Provide your PlanetScale `DATABASE_URL`
3. Set `DB_SSL=true`

**For Supabase PostgreSQL:**
1. Set `DB_TYPE=postgres`
2. Provide your Supabase connection string
3. Set `DB_SSL=true`

## Service Configuration

### Build Settings
- **Build Command**: `yarn install && yarn build`
- **Start Command**: `yarn start`
- **Node Version**: 20.x (specified in package.json engines)

### Environment Settings
- **Auto-Deploy**: Enabled (deploys on git push)
- **Environment**: Production
- **Region**: Choose closest to your users

## Troubleshooting

### Build Failures
- **Node.js Version**: Ensure using Node.js 20+ (check package.json engines)
- **Dependencies**: Verify all PostgreSQL dependencies are installed
- **Build Logs**: Check Render build logs for specific errors

### Database Connection Issues
- **SSL Configuration**: Ensure `DB_SSL=true` for Render PostgreSQL
- **Connection String**: Verify `DATABASE_URL` is properly set
- **Database Type**: Confirm `DB_TYPE=postgres` is set
- **Migration Issues**: Check if TypeORM migrations ran successfully

### Environment Variable Problems
- **Firebase JSON**: Ensure Firebase service account JSON is properly formatted
- **VAPID Keys**: Verify VAPID keys don't have extra spaces or newlines
- **Database Type**: Double-check `DB_TYPE` is set to correct value

### Push Notification Issues
- **Firebase Permissions**: Verify Firebase service account has FCM permissions
- **CORS Origins**: Ensure `ORIGIN_WEB_SDK` includes your frontend domains
- **VAPID Keys**: Confirm VAPID keys match between client and server

## PostgreSQL-Specific Configuration

### TypeORM Settings
The application automatically detects PostgreSQL and configures:
- Native UUID types for primary keys
- PostgreSQL-specific timestamp functions
- Automatic triggers for `updatedAt` fields
- Named enum types for platform fields

### Performance Optimization
Render PostgreSQL includes:
- Connection pooling
- Query optimization
- Automatic vacuuming
- Performance monitoring

## Custom Domain Setup

1. **Purchase Domain** (Optional)
   - Use Namecheap, Google Domains, or similar provider
   - Cost: ~$10-15/year

2. **Configure DNS**
   - In Render: Settings → Custom Domains
   - Add your domain name
   - Configure DNS CNAME record to point to Render
   - SSL certificate automatically provisions

3. **Free Domain Alternatives**
   - Use Render subdomain (yourapp.onrender.com)
   - Free subdomains from various providers

## Monitoring

### Health Checks
- **Application Health**: `GET /` endpoint
- **Database Connectivity**: Monitor PostgreSQL metrics in Render dashboard
- **Application Logs**: Available in Render logs section

### Performance Monitoring
- **Database Metrics**: Connection count, query performance
- **Application Metrics**: Response times, memory usage
- **Error Tracking**: Monitor logs for errors and exceptions

## Scaling

### Free Tier Limits
- **Web Service**: 750 hours/month compute time
- **PostgreSQL**: 90-day free trial, then $7/month
- **Bandwidth**: 100GB/month outbound
- **Build Minutes**: 500 minutes/month

### Upgrading
- **Paid Plans**: Start at $7/month for web services
- **Always-On**: No sleep mode on paid plans
- **Higher Resources**: More CPU and memory
- **Priority Support**: Faster response times

## Security Considerations

### Database Security
- **SSL/TLS**: Automatically enabled for Render PostgreSQL
- **Network Isolation**: Database isolated from external access
- **Automatic Updates**: Security patches applied automatically

### Application Security
- **Environment Variables**: Securely stored and encrypted at rest
- **HTTPS**: Automatic SSL certificate provisioning
- **CORS**: Configure `ORIGIN_WEB_SDK` restrictively

### Webhook Security
- **Signature Verification**: Fireblocks webhook signatures automatically verified
- **Production Keys**: Use production webhook public key for production
- **Rate Limiting**: Built-in protection against abuse

## Backup and Recovery

### Database Backups
- **Automatic Backups**: Daily backups for PostgreSQL databases
- **Point-in-Time Recovery**: Available on paid plans
- **Manual Exports**: Export database using pg_dump

### Application Backups
- **Source Code**: Backed up in your Git repository
- **Environment Variables**: Document securely outside of version control
- **Deployment History**: Previous deployments available in Render dashboard

## Migration from Railway

If migrating from Railway MySQL to Render PostgreSQL:

1. **Export Data**: Create MySQL dump from Railway
2. **Convert Schema**: Use migration tools to convert MySQL → PostgreSQL
3. **Update Environment**: Change `DB_TYPE=postgres` and database connection
4. **Test Thoroughly**: Verify all functionality works with PostgreSQL
5. **Update Client**: Ensure frontend points to new Render deployment

## Next Steps

After successful deployment:

1. **Test API Endpoints**
   - Health check: `curl https://yourapp.onrender.com/`
   - Register device: `POST /api/notifications/register-token`
   - Get VAPID key: `GET /api/notifications/vapid-public-key`

2. **Configure Frontend**
   - Update API endpoints to point to Render deployment
   - Use the deployed VAPID public key endpoint
   - Test push notification flow end-to-end

3. **Set Up Monitoring**
   - Monitor application and database metrics
   - Set up alerts for errors and performance issues
   - Track push notification delivery rates

4. **Production Hardening**
   - Configure appropriate `LOG_LEVEL` for production
   - Set restrictive CORS origins
   - Review and rotate secrets regularly
   - Consider upgrading to paid plan for always-on service