# AI Trend Hub

AI Trend Hub is a Next.js 14 app for tracking AI trends, generating brand-voice articles, and creating social posts from curated RSS and Reddit sources.

## What it does
- Pulls trends from RSS feeds and selected Reddit communities
- Scores trends by recency, engagement, and source authority
- Lets an authenticated owner save items and create article drafts
- Generates content in Jack Whatley’s voice with CTA support
- Exposes monitoring endpoints for health, logs, analytics, and performance

## Stack
- Next.js 14 + TypeScript
- Prisma + PostgreSQL
- NextAuth.js
- Tailwind CSS
- Recharts

## Key app areas
- `app/dashboard` — overview, category pages, saved items, settings, articles
- `app/api` — trends, articles, social posts, monitoring, CTA analytics, refresh jobs
- `lib/rss-parser.ts` — RSS ingestion
- `lib/reddit-scraper.ts` — Reddit ingestion and quality filtering
- `lib/trend-scoring.ts` — normalized 1–100 trend scoring
- `lib/voice-profile.ts` — Jack Whatley brand voice + framework mapping
- `scripts/seed.ts` — seed data for users, categories, and sources

## Local run
```bash
npm install
npm run dev
```

## Environment
At minimum, configure:
- `DATABASE_URL`
- NextAuth secrets / auth env vars
- Any content-generation provider env vars used by the deployment

## Notes
- The repo contains a legacy `nextjs_space/` copy of the app alongside the active root app. Treat the root app as the current working copy unless you are intentionally reconciling the duplicate tree.
- Reddit ingestion now filters out low-signal, off-topic posts more aggressively so the live trend feed stays focused on useful AI/business content.
