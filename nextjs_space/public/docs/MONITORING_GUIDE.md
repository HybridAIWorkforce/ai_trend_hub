# AI Trend Hub - Monitoring & Operations Guide

## Overview

The AI Trend Hub production deployment includes comprehensive monitoring, logging, and observability systems to track application health, performance, and user engagement.

## Monitoring Endpoints

### 1. Health Check Endpoint

**Endpoint:** `GET /api/monitoring/health`

Provides real-time application health status including database connectivity, performance metrics, and error summary.

**Status Codes:**
- `200`: Healthy - All systems operational
- `202`: Degraded - Minor issues detected
- `503`: Unhealthy - Critical issues

### 2. Logs Endpoint

**Endpoint:** `GET /api/monitoring/logs?limit=100&level=ERROR`

Retrieve recent application logs filtered by level.

**Query Parameters:**
- `limit` (default: 100) - Number of logs to retrieve
- `level` (optional) - Filter by log level (DEBUG, INFO, WARN, ERROR, CRITICAL)

**Authentication:** Owner only

### 3. Performance Metrics Endpoint

**Endpoint:** `GET /api/monitoring/performance?hoursAgo=1&slow=true&errors=true`

Detailed performance metrics including request latency, error rates, and slow requests.

**Query Parameters:**
- `hoursAgo` (default: 1) - Time range for metrics
- `slow` (default: false) - Include slow requests list
- `errors` (default: false) - Include recent errors list

**Authentication:** Owner only

### 4. Analytics Endpoint

**Endpoint:** `GET /api/monitoring/analytics?days=7`

User engagement and content creation analytics.

**Query Parameters:**
- `days` (default: 7) - Number of days to analyze

**Authentication:** Owner only

## Structured Logging System

### Log Levels

- **DEBUG** - Detailed diagnostic information
- **INFO** - General informational messages
- **WARN** - Warning messages for potential issues
- **ERROR** - Error messages for recoverable errors
- **CRITICAL** - Critical system failures

### Log Entry Structure

Each log entry includes:
- timestamp - ISO 8601 formatted timestamp
- level - Log level
- message - Human-readable log message
- context - Structured context (requestId, userId, endpoint, duration, etc.)

## Performance Monitoring

### Request Metrics

The system automatically tracks:
- Average response time per endpoint
- Maximum and minimum response times
- Error rate (4xx and 5xx responses)
- Request count per endpoint

### Slow Request Alerts

Requests exceeding 1000ms are automatically logged as warnings.

### Error Tracking

All 4xx and 5xx responses are tracked with full context.

## Database Monitoring

The health check endpoint tests database connectivity. If unavailable:
1. Application status becomes unhealthy
2. HTTP 503 is returned
3. A CRITICAL log entry is created

## Key Metrics to Monitor

### Performance

- Average Response Time: Target < 500ms
- Error Rate: Target < 1%
- Slow Requests: Target < 5 per hour

### User Engagement

- Daily Active Users
- Articles Created
- CTA Interactions
- Items Saved

### Database Health

- Connection Latency: Target < 100ms
- Query Response Time
- Connection Pool Status

## Setup Instructions

### 1. Accessing Monitoring Endpoints

All monitoring endpoints require authentication as the owner.

```bash
curl -H "Cookie: [session-cookie]" https://aitrendshub.abacusai.app/api/monitoring/health
```

### 2. Recommended Monitoring Tools

- **Uptime Monitoring**: Use Pingdom or UptimeRobot to monitor health endpoint every 5 minutes
- **Log Aggregation**: Check logs daily for errors and warnings
- **Performance Tracking**: Monitor performance metrics during peak hours
- **Alerts**: Set up notifications for health status changes

## Best Practices

1. Regular Monitoring: Check health endpoint at least daily
2. Alert Setup: Implement automated alerts for critical issues
3. Log Review: Review logs weekly for patterns
4. Performance Tracking: Monitor trends over time
5. Capacity Planning: Use analytics to plan for growth
6. Documentation: Keep runbook updated
7. Testing: Test monitoring systems monthly
8. Retention: Implement log archival strategy

## Common Issues & Solutions

### High Database Latency

**Cause**: Query performance or connection pool exhaustion

**Solution**:
1. Check database logs for slow queries
2. Review Prisma query patterns
3. Ensure connection pool size is appropriate
4. Consider database indexing

### High Error Rate on Article Generation

**Cause**: Usually LLM API timeouts or rate limits

**Solution**:
1. Check LLM API status
2. Review error logs for specific messages
3. Increase request timeout if needed
4. Implement retry logic

### Memory Usage Growing

**Cause**: In-memory log/metric buffers

**Solution**:
1. Buffers auto-cleanup at 1000-500 entries
2. Implement periodic log cleanup
3. Export logs to S3 or database

## Alerting Strategy

### Priority 1 (Critical)
- Health status = unhealthy
- Database connectivity lost
- Error rate > 10%

### Priority 2 (High)
- Health status = degraded
- Error rate > 5%
- Avg response time > 3000ms

### Priority 3 (Medium)
- Any ERROR level logs
- Slow requests > threshold
- Unusual traffic patterns
