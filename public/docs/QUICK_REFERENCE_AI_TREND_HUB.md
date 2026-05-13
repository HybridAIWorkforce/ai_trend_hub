# QUICK REFERENCE: AI TREND HUB
## Generated: April 13, 2026

---

## 🔑 Login Credentials

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `owner@aitrendhub.com` | `trendhub2024` | Admin | Auto-login enabled |
| `john@doe.com` | `johndoe123` | Admin | Backup account |

---

## 📁 Project Location

```
Project Root: /home/ubuntu/ai_trend_hub
App Code:     /home/ubuntu/ai_trend_hub/nextjs_space
Database:     PostgreSQL (shared dev/prod)
```

---

## 🚀 Quick Start Commands

```bash
# Start development server
cd /home/ubuntu/ai_trend_hub/nextjs_space && yarn dev

# Build for production
cd /home/ubuntu/ai_trend_hub/nextjs_space && yarn build

# Generate Prisma client
cd /home/ubuntu/ai_trend_hub/nextjs_space && yarn prisma generate

# Push database schema
cd /home/ubuntu/ai_trend_hub/nextjs_space && yarn prisma db push

# Open Prisma Studio (database browser)
cd /home/ubuntu/ai_trend_hub/nextjs_space && yarn prisma studio

# Run seed script
cd /home/ubuntu/ai_trend_hub/nextjs_space && npx tsx scripts/seed.ts
```

---

## 🌐 Environment Variables

| Variable | Purpose |
|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Session encryption key |
| `ABACUSAI_API_KEY` | LLM API for article generation |

---

## 📄 Key Files to Know

| File | What It Does |
|------|--------------|
| `lib/voice-profile.ts` | Jack's voice, IP frameworks, cross-industry apps |
| `app/api/articles/draft/route.ts` | Article generation (voice + AIDA + CTAs + industry) |
| `app/api/settings/cta/route.ts` | CTA configuration API |
| `app/dashboard/settings/page.tsx` | CTA settings UI |
| `components/articles/article-wizard.tsx` | 4-step article creation wizard |
| `components/articles/article-editor.tsx` | Article editor with versioning |
| `lib/rss-parser.ts` | RSS feed ingestion |
| `lib/reddit-scraper.ts` | Reddit web scraping |
| `lib/job-scheduler.ts` | Background refresh (30 min) |
| `prisma/schema.prisma` | Database schema (11 models) |
| `app/page.tsx` | Login page (auto-login) |
| `app/layout.tsx` | Root layout |

---

## 🧠 Jack's 7 IP Frameworks

| # | Framework | One-Line Summary |
|---|-----------|------------------|
| 1 | Skyscraper Foundation | Build deep before building tall (data foundation first) |
| 2 | 6-Stage Recruitment Cycle | Documented system: Welcome → Activate → Diagnose → Prescribe → Lifecycle → North Star |
| 3 | 4 Hire Up Funnels | FOMO Reactivation, Not Qualified Yet, New Activation, Abandoned Application |
| 4 | Co-Pilot System | AI accountability that monitors and enforces behavior |
| 5 | Improvement Flywheel | Continuous optimization using post-hire performance data |
| 6 | Maslow-Based Messaging | Messaging based on hierarchy of needs |
| 7 | Hybrid AI Workforce | Humans + AI collaboration > Full automation |

---

## 🏭 Supported Industries (Cross-Industry IP)

1. Recruitment (origin)
2. Sales / B2B
3. E-commerce / Retail
4. Restaurants / Hospitality
5. Healthcare
6. Manufacturing / Logistics
7. Professional Services
8. SaaS

---

## 📊 Database Models (11)

1. User (with ctaSettings JSON)
2. Account (NextAuth)
3. Session (NextAuth)
4. VerificationToken (NextAuth)
5. Category
6. Source
7. TrendItem
8. SavedItem
9. Article
10. ArticleVersion
11. JobRun

---

## 🔗 API Endpoints

**Auth:** `/api/auth/[...nextauth]`, `/api/signup`
**Data:** `/api/trends`, `/api/categories`, `/api/saved`, `/api/dashboard/stats`
**Jobs:** `/api/jobs/refresh`, `/api/init`
**Articles:** `/api/articles`, `/api/articles/[id]`, `/api/articles/angles`, `/api/articles/outline`, `/api/articles/draft`, `/api/articles/section-regenerate`, `/api/articles/[id]/social-posts`
**Settings:** `/api/settings/cta`

---

## 🎨 UI Pages

| Route | Purpose |
|-------|---------|
| `/` | Login (auto-login enabled) |
| `/dashboard` | Overview with stats and charts |
| `/dashboard/category/[id]` | Category detail view |
| `/dashboard/saved` | Saved/bookmarked items |
| `/dashboard/articles` | Article list |
| `/dashboard/articles/new` | Article creation wizard |
| `/dashboard/articles/[id]` | Article editor |
| `/dashboard/settings` | CTA configuration |

---

## 🎯 CTA System

**Access:** Dashboard → Settings

**Configuration Options:**
- Master toggle (enable/disable all CTAs)
- Book promotion (title, description, buy link, price)
- Video/course promotion (title, description, video link)
- Affiliate products (unlimited, with commission disclosure)
- Custom CTAs (unlimited)
- Style: invitational | direct | educational
- Placement: end | middle | both

**How It Works:**
1. Configure CTAs once in Settings
2. Every generated article automatically includes configured CTAs
3. CTAs written naturally in Jack's voice
4. Proper affiliate disclosures included

---

## 📝 Article Generation Pipeline

```
Trend Item → Step 1: Basics (audience, goal, tone, format)
          → Step 2: AI Angles (3-5 options, user selects)
          → Step 3: AI Outline (editable, drag-and-drop)
          → Step 4: AI Draft Generation
              ├── Voice Profile injection
              ├── AIDA Framework (if enabled)
              ├── Industry Detection → Cross-Industry IP
              ├── CTA Settings injection
              └── Guardrails (anti-salesy, authenticity)
          → Article Editor (edit, version, regenerate sections)
          → Export (Markdown, HTML, .md download)
```

---

## 🔧 Deployment Status

**Current:** NOT deployed to production
**To Deploy:** Use Abacus AI Agent deployment tool
**Database:** Shared between dev and production

---

**END OF QUICK REFERENCE**
