# AI Trend Hub - Complete API Documentation

## Overview

AI Trend Hub provides RESTful APIs for managing trends, articles, social media posts, and CTAs.

## Authentication

Authentication uses NextAuth.js with JWT-based sessions.

```bash
curl -X POST https://aitrendshub.abacusai.app/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@aitrendhub.com", "password": "trendhub2024", "redirect": false}'
```

After login, maintain session via cookies in all subsequent requests.

---

## Trends API

### Get Trends

**Endpoint:** `GET /api/trends`

Fetch trend items with filtering, pagination, and search.

**Query Parameters:**
- categoryId (string) - Filter by category ID
- sourceType (string) - Filter by source (reddit, rss)
- timeRange (string) - Time range (24h, 7d, 30d, all)
- search (string) - Search in title and summary
- page (number) - Page number
- limit (number) - Items per page

**Example:**
```bash
curl "https://aitrendshub.abacusai.app/api/trends?categoryId=cat-1&timeRange=7d&page=1"
```

### Get Categories

**Endpoint:** `GET /api/categories`

Fetch all available categories.

---

## Articles API

### List Articles

**Endpoint:** `GET /api/articles`

Fetch articles created by current user.

### Create Article Draft

**Endpoint:** `POST /api/articles/draft`

Generate an article draft using AI.

**Request Body:**
```json
{
  "trendItemId": "item-123",
  "angle": "How this technology solves recruitment challenges",
  "title": "AI in Modern Recruitment",
  "outline": { "introduction": {}, "sections": [], "conclusion": {} },
  "audience": "HR professionals",
  "goal": "educate",
  "tone": "professional",
  "format": "long_form",
  "language": "en",
  "useAida": true
}
```

### Generate Article Outline

**Endpoint:** `POST /api/articles/outline`

Generate article outline from title and angle.

### Get Article Angles

**Endpoint:** `POST /api/articles/angles`

Generate multiple article angles for a trend.

---

## Social Media Posts API

### Generate Social Posts

**Endpoint:** `POST /api/articles/[id]/social-posts`

Generate social media posts across platforms.

**Request Body:**
```json
{
  "platforms": ["twitter", "linkedin", "facebook"]
}
```

**Platform Limits:**
- Twitter/X: 280 characters
- LinkedIn: 3000 characters
- Facebook: 500 characters

---

## CTA Management API

### Get CTA Settings

**Endpoint:** `GET /api/settings/cta`

Fetch current CTA configuration.

### Update CTA Settings

**Endpoint:** `POST /api/settings/cta`

Update CTA settings.

### Track CTA Events

**Endpoint:** `POST /api/cta-analytics`

Record CTA interaction events (impression, click, copy).

### Get CTA Analytics

**Endpoint:** `GET /api/cta-analytics`

Fetch CTA performance analytics for last 30 days.

---

## Saved Items API

### Save Item

**Endpoint:** `POST /api/saved`

Save a trend item.

### Remove Saved Item

**Endpoint:** `DELETE /api/saved?trendItemId=item-123`

---

## Dashboard API

### Get Dashboard Stats

**Endpoint:** `GET /api/dashboard/stats`

Fetch dashboard overview statistics including trends by category, recent items, and trending tags.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error code",
  "message": "Human-readable error message"
}
```

**Common Error Codes:**
- UNAUTHORIZED (401) - Not authenticated
- FORBIDDEN (403) - Not authorized
- NOT_FOUND (404) - Resource not found
- VALIDATION_ERROR (400) - Invalid request
- SERVER_ERROR (500) - Server error

---

## Rate Limiting

- Read endpoints (GET): 100 requests/minute per user
- Write endpoints (POST): 30 requests/minute per user
- LLM endpoints: 10 requests/hour per user

Response headers show rate limit info:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1713607200
```

---

## Authentication for Webhooks

For webhook implementations, use HMAC-SHA256 signature verification:

```bash
# Header: X-Webhook-Signature
# Value: sha256=<HMAC-SHA256 of request body>

echo -n $request_body | openssl dgst -sha256 -hmac $webhook_secret
```
