# Neiro Platform: Deployment Guide

**Version**: 1.0.0
**Date**: 2025-11-26
**Status**: Production Ready (Month 3 Complete)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Service Deployment](#service-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [Health Checks](#health-checks)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

---

## 🎯 Overview

Neiro Platform consists of **14 microservices** running in Docker containers:

### Core Services (Month 1-2)
1. **Auth Service** (4001) - JWT authentication
2. **Users Service** (4002) - User management
3. **Children Service** (4003) - Child profiles
4. **Diagnostics Service** (4004) - Questionnaires
5. **Routes Service** (4005) - Correction routes
6. **Assignments Service** (4006) - Task management
7. **Exercises Service** (4007) - Exercise library
8. **Templates Service** (4008) - Route templates

### Month 3 Services (NEW)
9. **Reports Service** (4009) - Report management & media
10. **Analytics Service** (4010) - Progress analytics
11. **Notifications Service** (4011) - Notifications & email

### Infrastructure
12. **Gateway (Nginx)** (8080) - API Gateway
13. **Web (Next.js)** (3001) - Frontend application
14. **PostgreSQL** (5437) - Primary database
15. **Redis** (6380) - Cache & sessions
16. **MinIO** (9000-9001) - Object storage

---

## 🔧 Prerequisites

### System Requirements

**Minimum**:
- CPU: 4 cores
- RAM: 8 GB
- Disk: 50 GB SSD
- OS: Ubuntu 20.04+ / macOS 12+ / Windows 11 with WSL2

**Recommended**:
- CPU: 8 cores
- RAM: 16 GB
- Disk: 100 GB SSD
- OS: Ubuntu 22.04 LTS

### Software Requirements

1. **Docker** >= 24.0.0
2. **Docker Compose** >= 2.20.0
3. **Node.js** >= 20.19.0 (for local development)
4. **pnpm** >= 8.0.0 (for local development)
5. **Git** >= 2.40.0

### Installation Commands

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# macOS (with Homebrew)
brew install docker docker-compose
brew install --cask docker

# Verify installations
docker --version
docker compose version
```

---

## 🔐 Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/neiro-platform.git
cd neiro-platform/nero_platform
```

### 2. Create Environment Files

#### Main `.env` file (root directory)

```bash
# Copy example environment
cp .env.example .env

# Edit with your values
nano .env
```

**Required Variables**:

```bash
# ============================================================
# DATABASE
# ============================================================
POSTGRES_USER=neiro_user
POSTGRES_PASSWORD=your_secure_password_here  # CHANGE THIS!
POSTGRES_DB=neiro_platform
DATABASE_URL=postgres://neiro_user:your_secure_password_here@postgres:5432/neiro_platform

# ============================================================
# REDIS
# ============================================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here  # CHANGE THIS!

# ============================================================
# JWT SECRETS
# ============================================================
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars  # CHANGE THIS!
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars  # CHANGE THIS!
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ============================================================
# MINIO (Object Storage)
# ============================================================
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=your_minio_password_here  # CHANGE THIS!
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=your_access_key_here  # CHANGE THIS!
MINIO_SECRET_KEY=your_secret_key_here  # CHANGE THIS!

# ============================================================
# SMTP (Email)
# ============================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com  # CHANGE THIS!
SMTP_PASSWORD=your_app_password_here  # Gmail App Password!
SMTP_FROM=noreply@neiro.dev

# ============================================================
# APPLICATION
# ============================================================
NODE_ENV=production
PLATFORM_URL=https://your-domain.com  # CHANGE THIS!
FRONTEND_URL=https://your-domain.com

# ============================================================
# MONITORING (Optional)
# ============================================================
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info
```

### 3. Generate Secrets

```bash
# Generate JWT secrets (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32

# Run this twice for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
```

---

## 💾 Database Setup

### 1. Initialize Database

```bash
# Start PostgreSQL only
docker compose up -d postgres

# Wait for PostgreSQL to be ready
docker exec neiro_postgres pg_isready -U neiro_user

# Expected output: postgres:5432 - accepting connections
```

### 2. Run Migrations

```bash
cd packages/database

# Apply all migrations (in order)
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0001_initial_schema.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0002_add_assignments.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0003_add_reports.sql
# ... (apply all migrations in sequence)
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0008_update_notification_model.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0009_create_user_notifications.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0010_create_notification_preferences.sql

# Verify tables created
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\dt"
```

### 3. Generate Prisma Client

```bash
# Generate Prisma client types
DATABASE_URL="postgres://neiro_user:your_password@localhost:5437/neiro_platform" \
  pnpm exec prisma generate
```

### 4. Seed Data (Optional for Development)

```bash
# Seed initial data
DATABASE_URL="postgres://neiro_user:your_password@localhost:5437/neiro_platform" \
  pnpm --filter @neiro/database db:seed

# This creates:
# - Admin user (admin@neiro.dev / admin123)
# - Test specialist
# - Test parents
# - Sample children
# - Sample routes, assignments, reports
```

---

## 🚀 Service Deployment

### Option 1: Full Stack Deployment (Recommended)

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### Option 2: Staged Deployment

```bash
# 1. Start infrastructure
docker compose up -d postgres redis minio

# 2. Wait for infrastructure to be ready (30 seconds)
sleep 30

# 3. Start backend services
docker compose up -d auth users children diagnostics routes assignments exercises templates

# 4. Start Month 3 services
docker compose up -d reports analytics notifications

# 5. Start gateway and frontend
docker compose up -d gateway web

# 6. Verify all services healthy
docker compose ps
```

### Build Individual Services

```bash
# Rebuild specific service
docker compose build reports
docker compose up -d reports

# View logs for specific service
docker compose logs -f reports

# Restart service
docker compose restart reports
```

---

## 🌐 Nginx Configuration

### 1. Nginx Setup (Included in docker-compose)

Nginx is configured as API Gateway on port 8080.

**Routes**:
```nginx
# Core services (Month 1-2)
/auth/         → http://auth:4001/auth/
/users/        → http://users:4002/users/
/children/     → http://children:4003/children/
/diagnostics/  → http://diagnostics:4004/diagnostics/
/routes/       → http://routes:4005/routes/
/assignments/  → http://assignments:4006/assignments/
/exercises/    → http://exercises:4007/exercises/
/templates/    → http://templates:4008/templates/

# Month 3 services
/reports/      → http://reports:4009/reports/
/analytics/    → http://analytics:4010/analytics/
/notifications/ → http://notifications:4011/notifications/
```

### 2. Custom Nginx Configuration

If you need custom Nginx config:

```bash
# Edit nginx.conf
nano nginx/nginx.conf

# Rebuild gateway
docker compose build gateway
docker compose up -d gateway

# Test configuration
docker exec neiro_gateway nginx -t
```

### 3. SSL/TLS Setup (Production)

```bash
# Install Certbot in Nginx container
docker exec neiro_gateway apt-get update
docker exec neiro_gateway apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
docker exec neiro_gateway certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (add to crontab)
0 12 * * * docker exec neiro_gateway certbot renew --quiet
```

---

## ✅ Health Checks

### 1. Service Health Status

```bash
# Check all services
docker compose ps

# Expected output: All services should show (healthy)
```

### 2. Manual Health Checks

```bash
# Infrastructure
curl http://localhost:5437  # PostgreSQL (should connect)
curl http://localhost:6380  # Redis (should connect)
curl http://localhost:9000  # MinIO (should show login)

# Backend Services (via Gateway)
curl http://localhost:8080/auth/health
curl http://localhost:8080/users/health
curl http://localhost:8080/children/health
curl http://localhost:8080/diagnostics/health
curl http://localhost:8080/routes/health
curl http://localhost:8080/assignments/health
curl http://localhost:8080/exercises/health
curl http://localhost:8080/templates/health
curl http://localhost:8080/reports/health
curl http://localhost:8080/analytics/health
curl http://localhost:8080/notifications/health

# Frontend
curl http://localhost:3001  # Should return HTML

# Expected response: {"status":"ok"} or similar
```

### 3. Database Connection Test

```bash
# Test PostgreSQL connection
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "SELECT version();"

# Check table count
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\dt" | wc -l
# Expected: 30+ tables
```

### 4. Redis Connection Test

```bash
# Test Redis connection
docker exec neiro_redis redis-cli ping
# Expected: PONG

# Check keys
docker exec neiro_redis redis-cli DBSIZE
```

---

## 📊 Monitoring

### 1. Service Logs

```bash
# View all logs
docker compose logs -f

# View specific service
docker compose logs -f reports

# View last 100 lines
docker compose logs --tail=100 analytics

# Follow specific service
docker compose logs -f --tail=50 notifications
```

### 2. Resource Usage

```bash
# Docker stats (CPU, Memory, Network)
docker stats

# Specific service stats
docker stats neiro_reports neiro_analytics neiro_notifications
```

### 3. Database Monitoring

```bash
# Active connections
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "SELECT pg_size_pretty(pg_database_size('neiro_platform'));"

# Table sizes
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC
LIMIT 10;
"
```

### 4. Application Metrics

```bash
# API response times (example with reports)
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/reports/health

# Create curl-format.txt:
echo "time_namelookup:  %{time_namelookup}\n\
time_connect:  %{time_connect}\n\
time_appconnect:  %{time_appconnect}\n\
time_pretransfer:  %{time_pretransfer}\n\
time_redirect:  %{time_redirect}\n\
time_starttransfer:  %{time_starttransfer}\n\
----------\n\
time_total:  %{time_total}\n" > curl-format.txt
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Service Won't Start

```bash
# Check logs
docker compose logs service-name

# Common issues:
# - Database not ready: Wait 30s after postgres starts
# - Port conflict: Change port in docker-compose.yml
# - Environment variables missing: Check .env file
```

#### 2. Database Connection Failed

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Test connection
docker exec neiro_postgres pg_isready -U neiro_user

# Check credentials
docker compose exec postgres env | grep POSTGRES

# Restart PostgreSQL
docker compose restart postgres
```

#### 3. Services Unhealthy

```bash
# Check health check configuration
docker compose config | grep healthcheck -A 5

# View detailed service status
docker inspect neiro_reports | grep -A 10 Health

# Common fixes:
docker compose restart service-name
docker compose up -d --force-recreate service-name
```

#### 4. Gateway 502 Bad Gateway

```bash
# Check backend service is running
docker compose ps backend-service

# Test backend directly
docker exec neiro_gateway curl http://backend-service:port/health

# Restart gateway
docker compose restart gateway
```

#### 5. Frontend Can't Connect to API

```bash
# Check NEXT_PUBLIC_API_URL in web service
docker compose exec web env | grep API

# Check Nginx routing
docker exec neiro_gateway cat /etc/nginx/conf.d/default.conf

# Test from frontend container
docker exec neiro_web curl http://gateway:8080/auth/health
```

### Debug Mode

```bash
# Enable debug logs
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d

# Or set LOG_LEVEL=debug in .env
echo "LOG_LEVEL=debug" >> .env
docker compose restart
```

---

## 🔄 Rollback Procedures

### 1. Rollback Services

```bash
# Stop and remove containers
docker compose down

# Checkout previous version
git checkout previous-tag-or-commit

# Rebuild and start
docker compose up -d --build

# Verify
docker compose ps
```

### 2. Rollback Database Migrations

```bash
# Run rollback scripts (in reverse order!)
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0010_rollback.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0009_rollback.sql
docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform < migrations/0008_rollback.sql

# Verify
docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\dt"
```

### 3. Backup & Restore

#### Backup

```bash
# Backup database
docker exec neiro_postgres pg_dump -U neiro_user neiro_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup MinIO data
docker run --rm \
  -v neiro_platform_minio-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/minio_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Backup Redis (if needed)
docker exec neiro_redis redis-cli SAVE
docker cp neiro_redis:/data/dump.rdb redis_backup_$(date +%Y%m%d_%H%M%S).rdb
```

#### Restore

```bash
# Restore database
cat backup_20251126_120000.sql | docker exec -i neiro_postgres psql -U neiro_user -d neiro_platform

# Restore MinIO
docker run --rm \
  -v neiro_platform_minio-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/minio_backup_20251126_120000.tar.gz -C /data

# Restart services
docker compose restart
```

---

## 🚦 Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Secrets generated and secure (32+ chars)
- [ ] Database migrations tested
- [ ] Backup system configured
- [ ] Monitoring setup (logs, metrics)
- [ ] SSL certificates obtained
- [ ] Firewall rules configured
- [ ] Health checks passing

### Deployment

- [ ] Database backed up
- [ ] Services deployed in stages
- [ ] Health checks verified
- [ ] API endpoints tested
- [ ] Frontend accessible
- [ ] Email sending tested
- [ ] File uploads tested

### Post-Deployment

- [ ] Monitor logs for errors
- [ ] Check resource usage
- [ ] Verify all integrations working
- [ ] Test user workflows
- [ ] Update documentation
- [ ] Notify stakeholders

---

## 📞 Support

### Documentation Links

- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API_CONTRACTS_MVP.md)
- [Development Guide](./DEVELOPMENT.md)
- [Month 3 Completion Report](./MONTH_3_WEEK_1-3_COMPLETION_REPORT.md)

### Getting Help

- **GitHub Issues**: https://github.com/your-org/neiro-platform/issues
- **Team Slack**: #neiro-platform-dev
- **Email**: devops@neiro.dev

---

**Last Updated**: 2025-11-26
**Version**: 1.0.0
**Status**: Production Ready
