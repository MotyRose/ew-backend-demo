# Deployment Guide - Railway

This guide provides step-by-step instructions for deploying the Fireblocks push notification service to Railway.

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

3. **Railway Setup**
   - Go to [railway.app](https://railway.app)
   - Sign up/in with GitHub
   - Create "New Project" → "Deploy from GitHub repo"
   - Select your repository

4. **Add MySQL Database**
   - In Railway project: "New Service" → "Database" → "Add MySQL"
   - Database variables are automatically created

5. **Environment Variables**
   - Copy from `.env.railway` template
   - Replace all placeholder values with your actual configuration
   - Paste Firebase service account JSON content as environment variable

6. **Deploy**
   - Push to main branch triggers automatic deployment
   - Monitor logs in Railway dashboard

## Environment Variables Checklist

### Required Variables
- [ ] `DB_TYPE` - Set to "mysql" for Railway MySQL database
- [ ] `DB_SSL` - Set to "false" for Railway MySQL (SSL not required)
- [ ] `JWKS_URI` - Your JWT authentication provider's JWKS endpoint
- [ ] `ISSUER` - JWT token issuer
- [ ] `AUDIENCE` - JWT token audience
- [ ] `FIREBLOCKS_WEBHOOK_PUBLIC_KEY` - Fireblocks webhook verification key
- [ ] `VAPID_PUBLIC_KEY` - Generated Web Push public key
- [ ] `VAPID_PRIVATE_KEY` - Generated Web Push private key
- [ ] `VAPID_SUBJECT` - Your contact email for Web Push
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` - Complete Firebase service account JSON content

### Auto-Generated (Railway MySQL)
- [ ] `MYSQLHOST` - Database host (mapped to DB_HOST)
- [ ] `MYSQLPORT` - Database port (mapped to DB_PORT)
- [ ] `MYSQLUSER` - Database username (mapped to DB_USERNAME)
- [ ] `MYSQL_ROOT_PASSWORD` - Database password (mapped to DB_PASSWORD)
- [ ] `MYSQLDATABASE` - Database name (mapped to DB_NAME)
- [ ] `PORT` - Application port (automatically set by Railway)

### Optional
- [ ] `ORIGIN_WEB_SDK` - CORS origins for your frontend
- [ ] `LOG_LEVEL` - Logging level (default: info)

## Database Configuration

### MySQL-Specific Settings
Railway automatically configures MySQL with the following features:
- Native MySQL data types and functions
- `CURRENT_TIMESTAMP` for timestamp defaults
- `ON UPDATE CURRENT_TIMESTAMP` for auto-updating fields
- Inline enum types for platform fields
- VARCHAR(36) for UUID primary keys

### TypeORM Integration
The application automatically detects MySQL and configures:
- Connection pooling with Railway MySQL
- Automatic migrations on startup
- MySQL-specific column types and constraints
- Proper indexing for performance

### Alternative Database Options
While Railway MySQL is recommended, you can also use external databases:
- **PlanetScale**: Set `DB_TYPE=mysql` and provide your connection string
- **External PostgreSQL**: Set `DB_TYPE=postgres` and configure SSL settings
- See `DATABASE-COMPARISON.md` for detailed comparison

## Troubleshooting

### Build Failures
- Check Node.js version (requires >=20)
- Verify all dependencies in package.json
- Review build logs in Railway dashboard

### Database Connection Issues
- Ensure MySQL plugin is added to Railway project
- Verify database environment variables are set
- Check database connection logs

### Environment Variable Problems
- Ensure no trailing spaces in variable values
- Verify Firebase service account file is uploaded correctly
- Check VAPID keys are properly formatted

### Push Notification Issues
- Verify Firebase service account has correct permissions
- Ensure VAPID keys match between client and server
- Check CORS origins include your frontend domains

## Custom Domain Setup

1. **Purchase Domain** (Optional)
   - Use Namecheap, Google Domains, or similar provider
   - Cost: ~$10-15/year

2. **Configure DNS**
   - In Railway: Settings → Domains → Add custom domain
   - Add CNAME record pointing to Railway's domain
   - SSL certificate automatically provisions

3. **Free Domain Alternatives**
   - Use Railway subdomain (yourapp.railway.app)
   - Register free domain from Freenom (.tk, .ml, .ga)

## Monitoring

### Health Checks
- Application health: `GET /`
- Database connectivity: Monitor Railway database metrics
- Application logs: Railway dashboard logs section

### Performance Monitoring
- Railway provides built-in metrics
- Monitor memory and CPU usage
- Track request response times

## Scaling

### Free Tier Limits
- 500 execution hours/month
- 1GB RAM per service
- 1GB disk storage for database

### Upgrading
- Railway offers paid plans starting at $5/month
- Always-on service (no sleep mode)
- Higher resource limits
- Priority support

## Security Considerations

### Environment Variables
- Never commit secrets to version control
- Use Railway's environment variable management
- Rotate Firebase service account keys regularly

### Network Security
- Railway provides automatic SSL/TLS
- Configure CORS origins restrictively
- Monitor access logs for suspicious activity

### Webhook Security
- Fireblocks webhook signatures are automatically verified
- Use production webhook public key for production deployments
- Monitor webhook endpoint for failed requests

## Backup and Recovery

### Database Backups
- Railway provides automatic database backups
- Export database using Railway CLI or dashboard
- Store backups securely for disaster recovery

### Application Backups
- Source code is backed up in your Git repository
- Environment variables should be documented securely
- Firebase service account files should be stored securely

## Next Steps

After successful deployment:

1. **Test API Endpoints**
   - Health check: `curl https://yourapp.railway.app/`
   - Register device token: `POST /api/notifications/register-token`
   - Get VAPID key: `GET /api/notifications/vapid-public-key`

2. **Configure Frontend**
   - Update API endpoints to point to your Railway deployment
   - Use the deployed VAPID public key endpoint
   - Test push notification flow end-to-end

3. **Set Up Monitoring**
   - Monitor application logs regularly
   - Set up alerts for errors and performance issues
   - Track push notification delivery rates

4. **Production Hardening**
   - Enable production logging levels
   - Configure appropriate CORS origins
   - Review and rotate all secrets regularly