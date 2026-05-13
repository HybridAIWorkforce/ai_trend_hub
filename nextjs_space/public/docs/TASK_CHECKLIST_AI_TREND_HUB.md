# TASK CHECKLIST: AI TREND HUB
## Actionable Tasks to Complete the Project
## Generated: April 13, 2026

---

## 🔴 CRITICAL (Do First)

### ☐ Deploy to Production
- **Priority:** CRITICAL
- **Complexity:** Simple
- **Time:** 5-10 minutes
- **Steps:**
  1. Run deployment from Abacus AI Agent
  2. Verify app loads at public URL
  3. Test auto-login works in production
  4. Confirm dashboard loads with data
- **Definition of Done:**
  - [ ] App accessible at public URL
  - [ ] Auto-login works
  - [ ] Dashboard displays data
  - [ ] Article creation works

---

## 🟡 HIGH PRIORITY (Do This Week)

### ☐ Configure Real CTA Settings
- **Priority:** High
- **Complexity:** Simple
- **Time:** 10 minutes
- **Steps:**
  1. Navigate to Settings page
  2. Enable master CTA toggle
  3. Add book: "Reshaping Recruitment" with Amazon link and price
  4. Add video/course link (if available)
  5. Add affiliate products (if any)
  6. Select style: "invitational" (recommended)
  7. Select placement: "end" (start here, test "both" later)
  8. Save settings
- **Definition of Done:**
  - [ ] Book promotion configured
  - [ ] Settings saved successfully
  - [ ] Generated article includes CTAs

### ☐ Generate & Validate Cross-Industry Articles
- **Priority:** High
- **Complexity:** Simple
- **Time:** 30-60 minutes
- **Steps:**
  1. Generate article about AI in sales
  2. Verify Skyscraper/Funnels frameworks translate correctly
  3. Generate article about AI in restaurants
  4. Verify voice sounds authentic (not robotic)
  5. Generate article about AI in healthcare
  6. Check AIDA framework with guardrails
  7. Generate article about AI in manufacturing
  8. Review CTAs in all articles
- **Definition of Done:**
  - [ ] 4+ cross-industry articles generated
  - [ ] Voice profile sounds authentic in all
  - [ ] IP frameworks translate naturally
  - [ ] CTAs appear and feel invitational

### ☐ Add Custom RSS Feeds
- **Priority:** High
- **Complexity:** Medium
- **Time:** 30-60 minutes
- **Steps:**
  1. Identify Jack's preferred AI newsletters
  2. Find RSS feed URLs for each
  3. Add feeds to database via seed script or admin UI
  4. Trigger manual refresh
  5. Verify new items appear in dashboard
- **Definition of Done:**
  - [ ] Custom feeds added to Source table
  - [ ] Items appearing in dashboard
  - [ ] Categories properly assigned

---

## 🟢 MEDIUM PRIORITY (Next 2 Weeks)

### ☐ Build Full Social Media Post Generation
- **Priority:** Medium
- **Complexity:** Medium-High
- **Time:** 4-8 hours
- **Steps:**
  1. Design social post generation prompts (Twitter/X, LinkedIn)
  2. Implement character limits per platform
  3. Add hashtag generation
  4. Create preview UI for each platform
  5. Integrate with voice profile
  6. Test with real articles
- **Definition of Done:**
  - [ ] Twitter/X posts generated (280 char limit)
  - [ ] LinkedIn posts generated (3000 char limit)
  - [ ] Hashtags relevant and useful
  - [ ] Voice profile maintained

### ☐ Add SEO Metadata to Articles
- **Priority:** Medium
- **Complexity:** Medium
- **Time:** 2-4 hours
- **Steps:**
  1. Add meta description field to Article model
  2. Add keywords field
  3. Auto-generate SEO metadata with LLM
  4. Add editing UI in article editor
  5. Include in export options
- **Definition of Done:**
  - [ ] Meta description auto-generated
  - [ ] Keywords auto-generated
  - [ ] Editable in article editor
  - [ ] Included in HTML export

### ☐ Add More Reddit Subreddits
- **Priority:** Medium
- **Complexity:** Simple
- **Time:** 30 minutes
- **Steps:**
  1. Add industry-specific subreddits:
     - r/sales, r/smallbusiness, r/entrepreneur
     - r/restaurateur, r/healthcare
  2. Update scraper configuration
  3. Test scraping works
- **Definition of Done:**
  - [ ] New subreddits added
  - [ ] Items appearing in dashboard
  - [ ] Properly categorized

---

## 🔵 LOW PRIORITY (Future Enhancement)

### ☐ Publishing Integrations
- Publish to Medium, WordPress, LinkedIn
- Estimated: 8-16 hours

### ☐ Article Analytics
- View tracking, engagement metrics, CTA click tracking
- Estimated: 8-12 hours

### ☐ Featured Images for Articles
- AI-generated or stock image integration
- Estimated: 4-6 hours

### ☐ Multi-User System
- Registration flow, invitations, team permissions
- Estimated: 16-24 hours

### ☐ Email Newsletter Integration
- Auto-send articles to subscriber list
- Estimated: 4-8 hours

### ☐ Article Templates
- Pre-built templates for common article types
- Estimated: 2-4 hours

### ☐ Scheduled Publishing
- Queue articles for future publication
- Estimated: 4-6 hours

---

## ✅ COMPLETED TASKS

- [x] Core dashboard platform (dark theme, responsive)
- [x] PostgreSQL database with Prisma ORM (11 models)
- [x] Authentication system (NextAuth.js + JWT)
- [x] RSS feed parsing (TechCrunch, MIT, VentureBeat)
- [x] Reddit scraping (web scraper, no API)
- [x] Background job scheduler (30-min cycle)
- [x] Trend tracking with categories and sources
- [x] Save/bookmark functionality
- [x] Dashboard statistics and charts
- [x] Article creation wizard (4-step AI-powered)
- [x] Article editor with markdown support
- [x] Article versioning system
- [x] Export (Markdown, HTML, .md download)
- [x] Section-level regeneration
- [x] AIDA framework with guardrails
- [x] Voice profile (Jack Whatley)
- [x] 7 IP frameworks integrated
- [x] Cross-industry application (8+ industries)
- [x] Auto-login functionality
- [x] CTA management system
- [x] Bug fix: Failed to fetch error

---

**END OF TASK CHECKLIST**
