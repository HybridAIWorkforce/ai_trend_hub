# AI Trend Hub — Content Creation & Deployment Workflow

## Overview

AI Trend Hub is a personal AI-powered content engine built for Jack Whatley. It aggregates AI trends from RSS feeds and Reddit, then generates articles, social media posts, and CTAs using Jack's authentic voice profile and 7 IP frameworks.

---

## 1. Content Aggregation

### Sources
- **RSS Feeds** — Parsed via `lib/rss-parser.ts`, fetching AI news from configured feeds every 30 minutes.
- **Reddit** — Scraped via `lib/reddit-scraper.ts`, filtering AI-related posts from subreddits by keyword matching.

### Refresh Cycle
- Managed by `lib/job-scheduler.ts` with a 30-minute interval.
- Manual refresh available via `POST /api/jobs/refresh`.
- Job history tracked in the `JobRun` database table.

### Data Flow
```
RSS Feed / Reddit → Parser → TrendItem (DB) → Dashboard UI
```

---

## 2. Article Generation (AIDA Framework)

### Step-by-Step Wizard
1. **Select Trend** — Pick a trending item from the dashboard.
2. **Generate Angles** — `POST /api/articles/angles` produces 3-5 article angles.
3. **Choose Angle & Configure** — Set audience, goal, tone, format, language.
4. **Generate Outline** — `POST /api/articles/outline` creates structured outline.
5. **Generate Draft** — `POST /api/articles/draft` streams the full article via SSE.

### AIDA Toggle
- Optional AIDA framework toggle with guardrails (anti-sales-pitch protection).
- Tone calibration per article goal (educate, thought leadership, how-to, news analysis).
- 5-question authenticity check built into the prompt.

### Industry Detection
- `detectIndustryContext()` scores 11 industries using weighted keyword matching:
  - recruitment, sales/B2B, e-commerce, restaurants, healthcare, manufacturing, professional services, SaaS, education, fintech, real estate.
- Primary industry = highest-scoring non-recruitment industry.
- Cross-industry prompts for multi-industry articles (3+ industries detected).
- IP frameworks automatically mapped to detected industries.

### Voice Profile
- Stored in `lib/voice-profile.ts`.
- 7 IP frameworks with cross-industry translations.
- Writing style, tone, signature phrases, target audience, opening hooks.

---

## 3. Social Media Post Generation

### Endpoint
- **Article-based**: `POST /api/articles/[id]/social-posts`
- **Trend-based**: `POST /api/generate-social-post`

### Platforms & Limits
| Platform | Max Characters | Hashtag Limit |
|----------|---------------|---------------|
| Twitter / X | 280 | 3 |
| LinkedIn | 3,000 | 5 |
| Facebook | 500 | 2 |

### Features
- Platform toggle selection (generate for specific platforms).
- Edit-in-place with live character count.
- Three-tier character count warnings: green (safe), yellow (>90%), red (over limit).
- Smart truncation at sentence boundaries.
- Primary + suggested hashtags with click-to-swap.
- Topic extraction for context-aware hashtag generation.
- Fallback posts generated if LLM parsing fails.
- JSON response parsing handles markdown code blocks.

---

## 4. CTA Management

### Configuration (Settings → Call-to-Action Settings)
- **Master Toggle** — Enable/disable all CTAs.
- **Book Promotion** — Title, description, buy link, price.
- **Video/Course** — Title, description, video link.
- **Affiliate Products** — Unlimited products with name, description, link, commission note.
- **Custom CTAs** — Unlimited custom CTAs with text, link, description.
- **Style** — Invitational / Direct / Educational tone.
- **Placement** — End / Middle / Both.

### Validation
- URL validation on all link fields before save.
- Required field checks (title when section is enabled).
- Active CTA preview panel shows what's currently active.

### Analytics Tracking
- `CTAEvent` model tracks impressions, clicks, and copies.
- `GET /api/cta-analytics` returns 30-day summary with per-CTA breakdowns.
- UI in Settings → CTA Performance section.

### Integration with Article Generation
- CTAs injected into article generation prompts.
- Style guidance maps to specific language patterns.
- Placement control affects where CTAs appear in the article.

---

## 5. Deployment

### Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js with JWT sessions
- **LLM**: Abacus AI (gpt-4.1-mini)
- **Hosting**: Abacus AI App Platform → `aitrendshub.abacusai.app`

### Environment Variables
| Variable | Purpose |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `ABACUSAI_API_KEY` | LLM API access |

### Key Routes
| Route | Auth | Description |
|-------|------|------------|
| `/` | Public | Login (auto-login enabled) |
| `/dashboard` | Protected | Main overview |
| `/dashboard/articles` | Protected | Article management |
| `/dashboard/articles/new` | Protected | Article creation wizard |
| `/dashboard/articles/[id]` | Protected | Article editor |
| `/dashboard/settings` | Protected | CTA & profile settings |
| `/dashboard/saved` | Protected | Saved/bookmarked items |
| `/dashboard/category/[id]` | Protected | Category drill-down |

---

## 6. Troubleshooting

### Common Issues

**LLM returns empty or invalid JSON for social posts**
- Fallback posts are auto-generated.
- Check `ABACUSAI_API_KEY` is valid.
- Check server logs for `Failed to parse LLM social post response`.

**Articles fail to generate**
- Ensure the trend item exists and has content.
- Check that the outline was properly generated first.
- SSE streaming requires proper client handling.

**CTA settings not saving**
- Validate all URLs are properly formatted (https://...).
- Check for required fields when sections are enabled.
- Server logs: `Error saving CTA settings`.

**Industry detection seems wrong**
- Detection uses weighted keyword scoring from: title, angle, trend item title/summary/content, category, audience, and tags.
- Higher-weight terms (boost: 2-3) strongly influence industry ranking.
- Recruitment is always included as a baseline.

**Social posts exceed character limits**
- Posts are auto-truncated at sentence boundaries.
- Edit-in-place allows manual shortening.
- Yellow warning at 90% capacity, red when over.

**RSS/Reddit data not refreshing**
- Check `POST /api/jobs/refresh` returns success.
- Verify source URLs in the `Source` database table are reachable.
- Job history in `JobRun` table shows error details.

---

## 7. Database Schema (Key Models)

- `User` — Auth + CTA settings (JSON field).
- `Category` — RSS/Reddit feed categories.
- `Source` — Individual feed/subreddit configurations.
- `TrendItem` — Aggregated content items.
- `Article` — Generated articles with metadata.
- `ArticleVersion` — Version history for articles.
- `CTAEvent` — CTA performance tracking (impressions/clicks/copies).
- `SavedItem` — User bookmarks.
- `JobRun` — Background job status tracking.
