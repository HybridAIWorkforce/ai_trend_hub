# AI Trend Hub - Operations Runbook

## Quick Start for On-Call Operators

### Critical URLs

- **Production:** https://aitrendshub.abacusai.app
- **Health Check:** https://aitrendshub.abacusai.app/api/monitoring/health
- **Logs:** https://aitrendshub.abacusai.app/api/monitoring/logs
- **Performance:** https://aitrendshub.abacusai.app/api/monitoring/performance

### Emergency Credentials

- **Owner Account:** owner@aitrendhub.com / trendhub2024
- **Test Account:** john@doe.com / johndoe123

---

## Incident Response Procedure

### Step 1: Assess the Situation

1. Check health endpoint:
   ```bash
   curl https://aitrendshub.abacusai.app/api/monitoring/health
   ```

2. Identify status:
   - Green (200): Healthy
   - Yellow (202): Degraded
   - Red (503): Unhealthy - CRITICAL

3. Check error logs:
   ```bash
   curl -H "Cookie: [session]" \
     "https://aitrendshub.abacusai.app/api/monitoring/logs?level=ERROR"
   ```

### Step 2: Diagnose Root Cause

#### Database Connectivity Issue

**Symptoms:**
- database.connected: false
- Status = unhealthy
- All data queries failing

**Check:**
```bash
psql -U postgres -d aitrendhub -c "SELECT 1"
```

**Actions:**
1. Check database server status
2. Verify network connectivity
3. Check database size
4. Restart database if necessary

#### High Error Rate

**Symptoms:**
- errorRate > 5%
- Status = degraded or unhealthy

**Check endpoint failures:**
```bash
curl -H "Cookie: [session]" \
  "https://aitrendshub.abacusai.app/api/monitoring/performance?hoursAgo=1&errors=true"
```

#### Slow Response Times

**Symptoms:**
- avgResponseTime > 2000ms
- Users report slow loads

**Get slow queries:**
```bash
curl -H "Cookie: [session]" \
  "https://aitrendshub.abacusai.app/api/monitoring/performance?hoursAgo=4&slow=true"
```

### Step 3: Take Immediate Action

#### Restart Application

```bash
pm2 restart aitrendhub
```

#### Clear Buffers

```bash
# Restart application to clear in-memory logs/metrics
pm2 restart aitrendhub
```

#### Scale Resources

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Increase database connections in .env
DATABASE_POOL_SIZE=20
```

### Step 4: Communicate Status

1. Post status on status page
2. Send email if > 5 minutes downtime
3. Update monitoring dashboard
4. Document incident

---

## Critical Outage Recovery

### Immediate Actions (First 2 Minutes)

1. Declare incident and notify team
2. Check application status
3. Get error logs from CRITICAL level

### Recovery Steps

**Option 1: Restart Application**
```bash
pm2 restart aitrendhub --force
```

**Option 2: Restart Database**
```bash
sudo systemctl restart postgresql
```

**Option 3: Roll Back Changes**
```bash
git revert <commit-hash>
yarn build
DATABASE_URL=... yarn start
```

### Post-Recovery

1. Verify system health
2. Monitor closely for 30 minutes
3. Document root cause
4. Schedule post-mortem

---

## Deployment Procedures

### Pre-Deployment Checklist

- All tests passing
- Code reviewed
- Database migration tested
- Performance impact assessed
- Rollback plan prepared
- Backup created

### Deployment Steps

1. Create backup:
   ```bash
   pg_dump aitrendhub > backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. Build:
   ```bash
   yarn build
   ```

3. Run migrations:
   ```bash
   yarn prisma migrate deploy
   ```

4. Test new build:
   ```bash
   PORT=3001 yarn start
   ```

5. Deploy to production:
   ```bash
   pm2 stop aitrendhub
   # Copy files
   pm2 start aitrendhub
   ```

6. Verify deployment:
   ```bash
   sleep 30
   curl https://aitrendshub.abacusai.app/api/monitoring/health
   ```

### Rollback Procedure

If issues occur after deployment:

```bash
pm2 stop aitrendhub
git revert HEAD
yarn build
pm2 start aitrendhub
```

---

## Maintenance Tasks

### Daily (Automated)
- Health checks every 5 minutes
- Error log monitoring
- Database backups

### Weekly
```bash
# Review performance trends
curl -H "Cookie: [session]" \
  "https://aitrendshub.abacusai.app/api/monitoring/performance?hoursAgo=168"

# Check database size
psql -U postgres -d aitrendhub -c \
  "SELECT pg_size_pretty(pg_database_size('aitrendhub'));"
```

### Monthly

1. Database maintenance:
   ```bash
   psql -U postgres -d aitrendhub -c "VACUUM ANALYZE;"
   ```

2. Log archival - Export and save logs

3. Security review - Check credentials, access logs

---

## Common Issues & Solutions

### Out of Memory

**Symptoms:**
- App crashes with OOM
- Slow performance before crash

**Solutions:**
1. Increase memory:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096"
   ```
2. Clear caches
3. Restart app
4. Check for memory leaks

### Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" error
- All queries timing out

**Solutions:**
```bash
# Increase pool size
DATABASE_POOL_SIZE=30

# Restart app
pm2 restart aitrendhub

# Kill idle connections
psql -U postgres -d aitrendhub -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity \
   WHERE datname = 'aitrendhub' AND state = 'idle';"
```

### LLM API Timeouts

**Symptoms:**
- Article generation fails
- "Request timeout" error

**Solutions:**
1. Check LLM service status
2. Increase timeout in code
3. Implement retry logic
4. Switch fallback model
5. Queue requests

### High Disk Usage

**Symptoms:**
- Disk space low
- Database write errors

**Solutions:**
```bash
# Find large files
du -sh /home/ubuntu/ai_trend_hub/*

# Clean logs
find /home/ubuntu/ai_trend_hub -name "*.log" -mtime +30 -delete

# Compact database
psql -U postgres -d aitrendhub -c "VACUUM FULL;"
```

---

## Monitoring Checklist

Daily health check:

- Health endpoint returns 200
- Avg response time < 500ms
- Error rate < 1%
- No CRITICAL logs in 24h
- Database latency < 100ms
- Slow requests < 10
- Recent user activity
- Articles being created

---

## Escalation Path

1. **Level 1:** On-call operator (follow runbook)
2. **Level 2:** Senior engineer (if unresolved in 15 min)
3. **Level 3:** Tech lead (if unresolved in 30 min)
4. **Level 4:** CTO/Leadership (for business impact)

---

## Additional Resources

- Monitoring Guide: MONITORING_GUIDE.md
- API Documentation: API_DOCUMENTATION.md
- Content Workflow: CONTENT_CREATION_WORKFLOW.md
- User Guide: USER_GUIDE.md
