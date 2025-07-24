# Database Hosting Comparison Guide

This guide compares different database hosting options for the Fireblocks push notification service, helping you choose the best solution for your needs.

## Quick Comparison Table

| Option | Type | Cost | Maintenance | Control | Best For |
|--------|------|------|-------------|---------|----------|
| Railway MySQL | Cloud | Free (500h/month) | Managed | Low | Quick deployment |
| PlanetScale MySQL | Cloud | Free (5GB) | Managed | Medium | Production apps |
| Docker MySQL | Local | Free | Self-managed | Full | Local development |
| Self-hosted MySQL | Self-managed | Hardware costs | Self-managed | Full | Custom requirements |
| Render PostgreSQL | Cloud | Free (90 days) | Managed | Low | Render deployments |
| Supabase PostgreSQL | Cloud | Free (500MB) | Managed | Medium | Real-time features |
| Docker PostgreSQL | Local | Free | Self-managed | Full | Local development |
| Self-hosted PostgreSQL | Self-managed | Hardware costs | Self-managed | Full | Enterprise needs |

## Option 1: Railway MySQL (Current Default)

### ✅ Pros
- **Fully integrated**: Works seamlessly with Railway hosting
- **Zero setup**: Database automatically provisioned with hosting
- **Free tier**: 500 execution hours/month included
- **Automatic backups**: Built-in backup and recovery
- **Easy scaling**: Upgrade path to paid plans

### ❌ Cons
- **Limited free tier**: 500 hours/month execution limit
- **Sleep mode**: Service sleeps after inactivity
- **Vendor lock-in**: Tied to Railway platform
- **Less flexibility**: Limited database configuration options

### 💡 Best for
- Quick prototypes and demos
- Small to medium applications
- Users who want minimal setup complexity

---

## Option 2: PlanetScale MySQL (Recommended for Production)

### ✅ Pros
- **Generous free tier**: 5GB storage, 1 billion reads/month
- **Production-ready**: Built on MySQL and Vitess (YouTube's database)
- **Advanced features**: Database branching, non-blocking schema changes
- **High performance**: Serverless with automatic scaling
- **No sleep mode**: Always available
- **MySQL compatibility**: Works with existing TypeORM configuration

### ❌ Cons
- **Learning curve**: Unique branching workflow
- **Connection limits**: Limited concurrent connections on free tier
- **Requires separate setup**: Not integrated with hosting platform

### 💡 Best for
- Production applications
- Teams that need database branching
- Applications with high availability requirements

### Setup Steps
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create new database
3. Generate connection credentials
4. Use connection string in `DATABASE_URL` environment variable

---

## Option 3: Self-Hosted MySQL Docker

### ✅ Pros
- **Full control**: Complete database configuration control
- **Cost predictable**: Only hardware and electricity costs
- **No vendor lock-in**: Platform independence
- **High performance**: Optimized for your specific use case
- **Data sovereignty**: Complete control over data location and security

### ❌ Cons
- **High maintenance**: You handle updates, backups, security
- **Infrastructure required**: Need server/VPS to run Docker
- **Security responsibility**: Must secure database yourself
- **No automatic scaling**: Manual scaling required
- **Complexity**: Requires Docker and database administration skills

### 💡 Best for
- Organizations with dedicated DevOps teams
- Applications with specific compliance requirements
- High-volume applications needing custom optimization

### Setup Steps
1. Set up server/VPS with Docker
2. Run MySQL container with persistent volumes
3. Configure networking and security
4. Set up backup procedures
5. Monitor and maintain manually

---

## Option 4: Docker PostgreSQL (Recommended for Local Development)

### ✅ Pros
- **Zero cloud setup**: Complete local development environment
- **Full feature set**: PostgreSQL 15 with pgAdmin and Redis included
- **Performance optimization**: Pre-configured with production-ready settings
- **Data persistence**: Volumes survive container restarts
- **Easy management**: Simple make commands for all operations
- **No internet required**: Works completely offline
- **Free resources**: No usage limits or time restrictions

### ❌ Cons
- **Local only**: Not suitable for production deployment
- **Resource usage**: Consumes local CPU and memory
- **Docker dependency**: Requires Docker installation and knowledge
- **Manual scaling**: No automatic scaling capabilities
- **Backup responsibility**: Manual backup procedures required

### 💡 Best for
- Local development and testing
- Teams that prefer local database control
- Offline development environments
- Testing database-specific features

### Setup Steps
1. Install Docker and Docker Compose
2. Copy environment template: `cp .env.docker.postgres .env`
3. Start services: `make start-postgres-dev`
4. Run migrations: `yarn migration:run`
5. Access pgAdmin: http://localhost:8080

---

## Option 5: Docker MySQL (Alternative Local Development)

### ✅ Pros
- **Familiar technology**: MySQL is widely known
- **phpMyAdmin included**: Web-based database management
- **Lightweight**: Lower memory usage than PostgreSQL
- **Fast setup**: Quick to start and configure
- **Backward compatibility**: Matches original project setup
- **No internet required**: Works completely offline

### ❌ Cons
- **Local only**: Not suitable for production deployment
- **Limited advanced features**: Fewer features than PostgreSQL
- **Resource usage**: Still consumes local resources
- **Docker dependency**: Requires Docker knowledge
- **Manual maintenance**: No automatic optimization

### 💡 Best for
- Teams familiar with MySQL
- Lightweight local development
- Testing MySQL-specific features
- Backward compatibility needs

### Setup Steps
1. Install Docker and Docker Compose
2. Copy environment template: `cp .env.docker .env`
3. Start services: `make start-mysql-dev`
4. Run migrations: `yarn migration:run`
5. Access phpMyAdmin: http://localhost:8080

---

## Recommendations by Use Case

### 🚀 **Quick Prototype/Demo**
**Choice**: Railway MySQL
- Fastest setup with zero configuration
- Perfect for demos and proof-of-concept

### 💻 **Local Development**
**Choice**: Docker PostgreSQL (Recommended)
- Complete local development environment
- PostgreSQL 15 + pgAdmin + Redis included
- No cloud dependencies or API limits
- Alternative: Docker MySQL for MySQL-specific development

### 🏢 **Production Application**
**Choice**: PlanetScale MySQL or Render PostgreSQL
- **PlanetScale**: Production-ready with branching (5GB free)
- **Render PostgreSQL**: Integrated with hosting (90-day free)
- Both maintain compatibility with local Docker development

### 🔧 **Custom Requirements**
**Choice**: Self-hosted PostgreSQL or MySQL
- Full control for specific compliance or performance needs
- Best for teams with DevOps expertise
- Start with Docker locally, then deploy to production servers

### 💰 **Budget-Conscious Long-term**
**Choice**: Docker Local + PlanetScale Production
- **Development**: Free Docker PostgreSQL locally
- **Production**: PlanetScale's generous 5GB free tier
- **Scaling**: Easy upgrade path when needed

## Implementation Guide

Each database option has corresponding environment templates:

**Cloud/Production Options:**
- `.env.railway` - Railway MySQL configuration
- `.env.render` - Multiple database options for Render (PostgreSQL default)
- `.env.postgres` - PostgreSQL-specific configuration
- `.env.planetscale` - PlanetScale MySQL configuration

**Local Development Options:**
- `.env.docker.postgres` - Docker PostgreSQL with pgAdmin and Redis
- `.env.docker` - Docker MySQL with phpMyAdmin

**Self-Hosted Options:**
- `.env.docker` - Self-hosted Docker MySQL setup

**Quick Start Commands:**
```bash
# Local PostgreSQL development (recommended)
cp .env.docker.postgres .env && make start-postgres-dev

# Local MySQL development  
cp .env.docker .env && make start-mysql-dev

# Production PostgreSQL (Render)
cp .env.render .env  # Set DB_TYPE=postgres

# Production MySQL (PlanetScale)
cp .env.planetscale .env  # Set DB_TYPE=mysql
```

Choose the template that matches your selected database option and hosting platform.

---

## MySQL vs PostgreSQL Technical Comparison

This application supports both MySQL and PostgreSQL databases with automatic compatibility handling.

### Database Feature Comparison

| Feature | MySQL | PostgreSQL | Impact on Application |
|---------|-------|------------|----------------------|
| **UUID Support** | VARCHAR(36) | Native UUID | Automatic handling in migration |
| **Timestamp Functions** | CURRENT_TIMESTAMP | NOW() | Database-specific defaults |
| **Auto-Update Timestamps** | ON UPDATE CURRENT_TIMESTAMP | Triggers required | Migration creates PostgreSQL triggers |
| **Enum Types** | Inline enums | Named enum types | PostgreSQL requires explicit enum names |
| **JSON Support** | JSON type (MySQL 5.7+) | Native JSONB | Both supported by TypeORM |
| **Full-Text Search** | MATCH() AGAINST() | Built-in text search | Application doesn't use currently |
| **Connection Pooling** | Built-in | Built-in | Both supported by TypeORM |

### Performance Characteristics

**MySQL Advantages:**
- **Faster Simple Queries**: Better performance for simple SELECT/INSERT operations
- **Smaller Memory Footprint**: Generally uses less RAM
- **Mature Ecosystem**: Extensive tooling and documentation
- **Replication**: Robust master-slave replication built-in

**PostgreSQL Advantages:**
- **Complex Queries**: Better performance for complex JOINs and aggregations
- **ACID Compliance**: Stricter consistency guarantees
- **Extensibility**: Support for custom data types and functions
- **Advanced Features**: Array types, window functions, CTE support

### Cloud Provider Compatibility

**MySQL Cloud Options:**
- **PlanetScale**: Serverless MySQL with branching (5GB free)
- **Railway MySQL**: Integrated with hosting (500h/month free)
- **Amazon RDS MySQL**: Production-ready with auto-scaling
- **Google Cloud SQL MySQL**: Managed MySQL with high availability

**PostgreSQL Cloud Options:**
- **Render PostgreSQL**: Free 90-day trial with hosting integration
- **Supabase**: PostgreSQL with real-time features (500MB free)
- **Heroku Postgres**: Free tier available (10,000 rows)
- **Amazon RDS PostgreSQL**: Enterprise-grade managed service

### Migration and Compatibility

The application automatically handles database differences:

```typescript
// Automatic database detection in migration
const dbType = queryRunner.connection.options.type;
const isPostgres = dbType === "postgres";

// Database-specific configurations
const idColumn = isPostgres 
  ? { type: "uuid", generationStrategy: "uuid" }
  : { type: "varchar", length: "36", generationStrategy: "uuid" };
```

**Switching Databases:**
1. Change `DB_TYPE` environment variable (`mysql` or `postgres`)
2. Update connection parameters
3. Run migrations - schema automatically adapts
4. No application code changes required

### Recommendation by Use Case

**Choose MySQL if:**
- Using PlanetScale for production-grade branching
- Need maximum compatibility with existing tools
- Prioritizing simple query performance
- Team has strong MySQL expertise

**Choose PostgreSQL if:**
- Deploying on Render.com (integrated free tier)
- Need advanced SQL features (arrays, JSON, etc.)
- Planning complex analytics queries
- Want stricter ACID compliance

**Default Recommendation:**
- **Development**: PostgreSQL (better local development tools)
- **Production**: PlanetScale MySQL (best free tier features)
- **Render Deployment**: PostgreSQL (integrated free hosting)