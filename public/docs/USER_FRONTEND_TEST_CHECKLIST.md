# USER FRONTEND TEST CHECKLIST — AI Trend Hub
## Step-by-Step Testing Guide for All Features
## Last Updated: May 7, 2026

---

## 🎯 TEST ENVIRONMENT

- **URL:** https://aitrendshub.abacusai.app
- **Test Account (Auto-Login):** owner@aitrendhub.com / trendhub2024
- **Browser:** Chrome, Safari, or Firefox (recent versions)
- **Screen Resolution:** Test on desktop (1920x1080) and mobile (375x667)
- **Time Required:** 45-60 minutes for full test suite

---

## 📋 PRE-TEST SETUP

Before starting, complete these checks:

- [ ] Internet connection is stable
- [ ] Browser cache is cleared (or use incognito mode)
- [ ] JavaScript console is open (F12 → Console tab) to catch errors
- [ ] Have a text editor open to paste test content
- [ ] Tablet or phone available for mobile testing (optional)

---

## ✅ TEST SUITE 1: AUTHENTICATION & LOGIN (5 minutes)

### Test 1.1: Auto-Login on Homepage

1. [ ] Open https://aitrendshub.abacusai.app in a fresh incognito window
2. [ ] Verify you're automatically logged in (no login form shown)
3. [ ] Verify dashboard loads immediately
4. [ ] Check browser console for errors (should be empty)

**Expected Result:** Dashboard displays without manual login.

---

### Test 1.2: Session Expiry Banner (When Session Expires)

1. [ ] Wait for session to expire OR manually navigate to `/?expired=true`
2. [ ] Verify amber banner appears: **"🔒 Session expired — please sign in"**
3. [ ] Verify banner is above the login form
4. [ ] Click on email field and login again
5. [ ] Verify banner disappears after successful login

**Expected Result:** Clear session expiry message, successful re-login.

---

### Test 1.3: Logout & Confirmation

1. [ ] From the dashboard, click **"Logout"** button (top-right header)
2. [ ] Verify redirect to login page
3. [ ] Verify blue banner appears: **"👋 You have been logged out successfully."**
4. [ ] Verify you're not automatically logged in
5. [ ] Manually login again

**Expected Result:** Logout message appears, auto-login does NOT occur.

---

## ✅ TEST SUITE 2: DASHBOARD OVERVIEW (10 minutes)

### Test 2.1: Dashboard Loads & Stats Display

1. [ ] Navigate to https://aitrendshub.abacusai.app/dashboard
2. [ ] Verify page title is "Dashboard"
3. [ ] Verify the following stats appear:
   - [ ] **Total Trend Items** (number in blue box)
   - [ ] **New Today** (number in blue box)
   - [ ] **Saved Items** (number in blue box)
4. [ ] Verify **Category Breakdown** chart shows categories
5. [ ] Verify **AI Buzz - Last 7 Days** time-series chart displays

**Expected Result:** Dashboard fully loads with all statistics and charts.

---

### Test 2.2: Onboarding Modal (First Visit)

1. [ ] Clear browser localStorage (DevTools → Application → Local Storage → Clear All)
2. [ ] Refresh dashboard page
3. [ ] Verify **Onboarding Modal** appears with 3 steps
4. [ ] Click **Next** to advance through steps
5. [ ] Click **Get Started** on final step
6. [ ] Verify modal closes and dashboard is visible
7. [ ] Refresh page — verify modal does NOT appear again

**Expected Result:** 3-step onboarding displays once, then stored in localStorage.

---

### Test 2.3: Filters & Search

1. [ ] Verify **Filter Panel** on left side shows:
   - [ ] Time Range dropdown (24h, 7d, 30d, all)
   - [ ] Category dropdown
   - [ ] Search input field
2. [ ] Change **Time Range** to "7d" — verify list updates
3. [ ] Select a **Category** — verify items filter
4. [ ] Type in **Search** field — verify debounce works
5. [ ] Clear search field — verify all items reappear

**Expected Result:** All filters work without page reload.

---

### Test 2.4: Trend Cards Display

1. [ ] Scroll down to **Recent Items** grid
2. [ ] For each visible trend card, verify:
   - [ ] **Title** is displayed
   - [ ] **Source** name appears
   - [ ] **Summary** text is shown
   - [ ] **Tags** (AI keywords) appear
   - [ ] **Freshness Badge** appears (emerald/blue/amber/zinc)
   - [ ] **Score badge** appears (1-100)
   - [ ] **Save button** (bookmark icon) is present
   - [ ] **"Write Article"** button is present
3. [ ] Verify cards are responsive (stack on mobile)

**Expected Result:** All card elements visible and properly styled.

---

### Test 2.5: Freshness Badges (NEW SESSION 5)

1. [ ] Look at **Recent Items** cards
2. [ ] Identify badges on multiple cards:
   - [ ] **Emerald badge** — for items <6 hours old
   - [ ] **Blue badge** — for items 6-24 hours old
   - [ ] **Amber badge** — for items 1-3 days old
   - [ ] **Zinc badge** — for items >3 days old
3. [ ] Hover over badge to see tooltip with relative time
4. [ ] Verify badge colors match recency

**Expected Result:** All 4 color tiers visible; freshness logic is correct.

---

### Test 2.6: Save/Bookmark Functionality

1. [ ] Click **Save button** on a trend card
2. [ ] Verify button changes color (filled/highlighted)
3. [ ] Verify toast: "Saved to your library"
4. [ ] Navigate to **Saved Items** page
5. [ ] Verify saved item appears
6. [ ] Go back to **Dashboard**
7. [ ] Unsave the item (click bookmark again)
8. [ ] Verify it's removed from **Saved Items**

**Expected Result:** Save/unsave works bidirectionally.

---

## ✅ TEST SUITE 3: ARTICLE CREATION WIZARD (15 minutes)

### Test 3.1: Start Article Wizard

1. [ ] On dashboard, click **"Write Article"** button
2. [ ] Verify redirect to **Article Wizard** page
3. [ ] Verify progress bar shows 4 steps (Basics, Angle, Outline, Draft)
4. [ ] Verify "Save Draft & Exit" button appears (top-right)

**Expected Result:** Wizard loads with progress bar and save draft button.

---

### Test 3.2: Step 1 — Configure Basics

1. [ ] Verify form fields appear:
   - [ ] **Audience** dropdown
   - [ ] **Goal** dropdown
   - [ ] **Tone** dropdown
   - [ ] **Format** dropdown
   - [ ] **Language** dropdown
   - [ ] **AIDA Framework** toggle
2. [ ] Change **Audience** to "Sales Teams"
3. [ ] Change **Goal** to "Thought Leadership"
4. [ ] Change **Tone** to "Bold"
5. [ ] Change **Format** to "Deep Dive"
6. [ ] Toggle **AIDA Framework** ON
7. [ ] Click **Next** button
8. [ ] Navigate back to Step 1 — verify all selections persist

**Expected Result:** All form fields work and persist.

---

### Test 3.3: Step 2 — Choose Angle

1. [ ] Verify 3-5 **angle options** appear with descriptions
2. [ ] Click on one angle to select it
3. [ ] Click **Next** to proceed to Step 3

**Expected Result:** Angles load and can be selected.

---

### Test 3.4: Step 3 — Review Outline

1. [ ] Verify **outline structure** appears with sections
2. [ ] Try to edit a section title — verify text input works
3. [ ] Click **Next** to proceed to Step 4

**Expected Result:** Outline displays and is editable.

---

### Test 3.5: Step 4 — Generate Draft (Streaming)

1. [ ] Click **Generate Draft** button
2. [ ] Verify **streaming animation** starts
3. [ ] Verify article content **streams in real-time**
4. [ ] Verify **Jack Whatley's voice** is maintained
5. [ ] Wait for generation to complete (30-60 seconds)
6. [ ] Verify **"Draft Complete!"** message appears

**Expected Result:** Article generates with real-time streaming.

---

### Test 3.6: Save Draft & Exit (NEW SESSION 5)

1. [ ] While on ANY step of the wizard, click **"Save Draft & Exit"** button
2. [ ] Verify **loading spinner** appears on button
3. [ ] Verify toast: **"Draft saved! You can resume later from the Articles page."**
4. [ ] Verify redirect to **Articles** page
5. [ ] Find the newly saved draft
6. [ ] Verify it has a **blue "Resume" button** (not "Edit")
7. [ ] Click **Resume** button
8. [ ] Verify you're back at the same wizard step
9. [ ] Verify all form fields contain your previous selections
10. [ ] Verify you can continue from that step

**Expected Result:** Draft saves at any step; Resume returns to exact step with all data.

---

## ✅ TEST SUITE 4: ARTICLE EDITOR (12 minutes)

### Test 4.1: Open Article Editor

1. [ ] Complete the article wizard or open a saved article
2. [ ] Verify redirect to **Article Editor** page
3. [ ] Verify **article title** is editable
4. [ ] Verify **article content** is in markdown format
5. [ ] Verify **action panel** on right side with buttons

**Expected Result:** Editor loads with full editing interface.

---

### Test 4.2: Edit Article Content

1. [ ] Click into article **title** field
2. [ ] Modify the title
3. [ ] Verify title updates in real-time
4. [ ] Scroll to article body and **edit text**
5. [ ] Add a new paragraph or section
6. [ ] Use **bold** and **italic** markdown syntax
7. [ ] Verify markdown preview updates

**Expected Result:** Title and content are fully editable.

---

### Test 4.3: Generate Social Posts

1. [ ] Click **"Generate Social Posts"** button
2. [ ] Select platforms: **Twitter/X**, **LinkedIn**, **Facebook**
3. [ ] Click **Generate**
4. [ ] Verify **loading spinner** appears
5. [ ] Wait 20-30 seconds for posts
6. [ ] Verify **3 post cards** appear (one per platform)
7. [ ] Verify each post displays: platform name, text, character count

**Expected Result:** Posts generate for all selected platforms.

---

### Test 4.4: Social Media Preview Cards (NEW SESSION 5)

1. [ ] After posts generate, look for toggle buttons: "Edit Mode" and "Platform Preview"
2. [ ] Click **"Platform Preview"** button
3. [ ] Verify cards transform to show **platform-specific styling**:
   - [ ] **Twitter/X** — black background, verified badge, engagement bar
   - [ ] **LinkedIn** — white/light background, professional header
   - [ ] **Facebook** — dark background, share preview styling
4. [ ] Verify each platform looks realistic
5. [ ] Click **"Edit Mode"** to toggle back

**Expected Result:** Platform previews display accurately for all 3 platforms.

---

### Test 4.5: Edit Social Posts

1. [ ] In **Edit Mode**, click on a social post
2. [ ] Verify post **text becomes editable**
3. [ ] **Add some text** to the post
4. [ ] Verify **character count updates live**
5. [ ] Watch for color changes: Green (safe), Yellow (approaching), Red (over)
6. [ ] Click **Copy** button
7. [ ] Verify toast: "Copied to clipboard"

**Expected Result:** Posts are editable with live character count warnings.

---

### Test 4.6: Export Article

1. [ ] Click **"Export"** button
2. [ ] Verify dropdown menu appears with options
3. [ ] Click **"Download as Markdown"**
4. [ ] Verify `.md` file downloads
5. [ ] Open file to verify format
6. [ ] Click **"Export"** again
7. [ ] Click **"Download as HTML"**
8. [ ] Verify `.html` file downloads
9. [ ] Open in browser to verify styling

**Expected Result:** Both Markdown and HTML exports work.

---

## ✅ TEST SUITE 5: ARTICLE LIST & PUBLISH STATUS (10 minutes)

### Test 5.1: Article List Page Loads

1. [ ] Navigate to **Dashboard → Articles**
2. [ ] Verify page title is "Articles"
3. [ ] Verify list of articles appears
4. [ ] Verify articles are sorted by date (most recent first)
5. [ ] Verify **search and filter options** appear

**Expected Result:** Articles page loads with full list.

---

### Test 5.2: Publish Status Indicators (NEW SESSION 5)

1. [ ] On article list, look for **status badges** on each card
2. [ ] Identify badges with icons:
   - [ ] **Green badge with Globe icon** — Published articles
   - [ ] **Red badge with AlertTriangle icon** — Failed publish
   - [ ] **Gray badge with Edit3 icon** — Draft articles
   - [ ] **Amber badge** — Incomplete drafts
3. [ ] For **Published articles**, verify **published date** appears below badge
4. [ ] For **Failed articles**, hover over badge
5. [ ] For **Incomplete drafts**, verify **blue "Resume" button** is present
6. [ ] For **regular drafts**, verify **gray "Edit" button** is present

**Expected Result:** All 4 status states visible with correct icons.

---

### Test 5.3: Resume vs Edit Buttons

1. [ ] Find an **incomplete draft** article (amber badge)
2. [ ] Verify **"Resume" button** (blue) is shown
3. [ ] Click **Resume**
4. [ ] Verify wizard opens at the exact step you left off
5. [ ] Go back to article list
6. [ ] Find a **complete draft** or **published article**
7. [ ] Verify **"Edit" button** (gray) is shown
8. [ ] Click **Edit**
9. [ ] Verify editor opens (not wizard)

**Expected Result:** Resume shows for incomplete drafts; Edit for complete articles.

---

## ✅ TEST SUITE 6: CTA MANAGEMENT (8 minutes)

### Test 6.1: Navigate to Settings

1. [ ] Click **Dashboard → Settings**
2. [ ] Verify **Settings** page loads
3. [ ] Verify **CTA Settings** section appears
4. [ ] Verify **Master CTA Toggle** is visible

**Expected Result:** Settings page loads with CTA section.

---

### Test 6.2: Configure CTAs

1. [ ] Toggle **Enable CTAs** to ON
2. [ ] Fill in:
   - [ ] Book: "Reshaping Recruitment" title
   - [ ] Amazon link
   - [ ] Price
3. [ ] Fill in optional fields
4. [ ] Verify **CTA Style** dropdown has options (Invitational, Direct, Educational)
5. [ ] Select **"Invitational"** style
6. [ ] Verify **CTA Placement** dropdown (End, Middle, Both)
7. [ ] Select **"End"** placement
8. [ ] Click **Save Settings**
9. [ ] Verify toast: "Settings saved successfully"

**Expected Result:** All CTA fields saveable with confirmation.

---

### Test 6.3: CTA Preview

1. [ ] Scroll to **Active CTA Preview** section
2. [ ] Verify all configured CTAs are displayed
3. [ ] Verify each CTA shows **validation status**:
   - [ ] Green checkmark ✓ = valid URL
   - [ ] Red alert ⚠️ = invalid URL
4. [ ] Verify CTAs use **invitational style**

**Expected Result:** Preview shows all active CTAs with validation status.

---

### Test 6.4: CTA Analytics

1. [ ] Click **"View Analytics"** (if button exists)
2. [ ] Verify analytics dashboard appears with:
   - [ ] **Total Impressions**
   - [ ] **Total Clicks**
   - [ ] **Click-through Rate**
   - [ ] **Recent Activity**
3. [ ] Verify data is aggregated over **last 30 days**
4. [ ] Verify breakdown by **CTA type** and **platform**

**Expected Result:** Analytics display impressions, clicks, and breakdowns.

---

## ✅ TEST SUITE 7: RESPONSIVE DESIGN (5 minutes)

### Test 7.1: Mobile Layout (375px width)

1. [ ] Open DevTools (F12)
2. [ ] Set viewport to **375px × 667px** (iPhone size)
3. [ ] Navigate to **Dashboard** page
4. [ ] Verify:
   - [ ] Sidebar collapses or becomes hamburger menu
   - [ ] Filters stack vertically
   - [ ] Trend cards display in single column
   - [ ] Buttons are touch-friendly (min 44px height)
   - [ ] No horizontal scrolling
5. [ ] Open an **article** page on mobile
6. [ ] Verify content is readable (no overflow)
7. [ ] Click **Generate Social Posts**
8. [ ] Verify cards stack vertically

**Expected Result:** All pages are responsive and mobile-friendly.

---

### Test 7.2: Tablet Layout (768px width)

1. [ ] Set viewport to **768px × 1024px** (iPad size)
2. [ ] Navigate to **Dashboard**
3. [ ] Verify layout is balanced
4. [ ] Verify article editor is usable (no text field overflow)

**Expected Result:** Tablet layout is readable and usable.

---

## ✅ TEST SUITE 8: PERFORMANCE & ERRORS (5 minutes)

### Test 8.1: Console for Errors

1. [ ] Open DevTools → **Console** tab
2. [ ] Navigate through all pages
3. [ ] Verify **NO errors** appear in console
4. [ ] Verify **NO red error messages** are shown
5. [ ] Look for hydration errors (should be none)

**Expected Result:** Console is clean with no errors.

---

### Test 8.2: Network Performance

1. [ ] Open DevTools → **Network** tab
2. [ ] Reload **Dashboard** page
3. [ ] Verify:
   - [ ] All requests complete (no red failed requests)
   - [ ] No 4xx or 5xx HTTP errors
   - [ ] Largest assets load under 1 second
4. [ ] Generate an article and watch network requests
5. [ ] Verify streaming response works

**Expected Result:** Network requests complete without errors.

---

### Test 8.3: Page Load Speed

1. [ ] Open DevTools → **Performance** tab
2. [ ] Record page load on **Dashboard** page
3. [ ] Verify **First Contentful Paint (FCP)** is under 2 seconds
4. [ ] Verify **Largest Contentful Paint (LCP)** is under 3 seconds
5. [ ] Repeat for **Article Editor** page

**Expected Result:** Pages load within acceptable performance metrics.

---

## ✅ TEST SUITE 9: CROSS-BROWSER TESTING (5 minutes)

### Test 9.1: Chrome/Chromium

1. [ ] Open app in **Chrome** browser
2. [ ] Run quick smoke test:
   - [ ] Login works
   - [ ] Dashboard loads
   - [ ] Start article wizard
   - [ ] Generate article
3. [ ] Verify no console errors

**Expected Result:** All features work in Chrome.

---

### Test 9.2: Safari

1. [ ] Open app in **Safari** browser
2. [ ] Repeat smoke test
3. [ ] Verify no console errors

**Expected Result:** All features work in Safari.

---

### Test 9.3: Firefox

1. [ ] Open app in **Firefox** browser
2. [ ] Repeat smoke test
3. [ ] Verify no console errors

**Expected Result:** All features work in Firefox.

---

## ✅ TEST SUITE 10: DOCUMENTATION (2 minutes)

### Test 10.1: Documentation Accessibility

1. [ ] Navigate to **https://aitrendshub.abacusai.app/docs/**
2. [ ] Verify list of PDFs appears
3. [ ] Download/view:
   - [ ] **USER_GUIDE.pdf** — All user features
   - [ ] **CONTENT_CREATION_WORKFLOW.pdf** — Technical workflow
   - [ ] **TASK_CHECKLIST_AI_TREND_HUB.pdf** — Project completion status
4. [ ] Verify PDFs are readable
5. [ ] Verify PDFs mention:
   - [ ] Draft management
   - [ ] Social media preview cards
   - [ ] Publish status indicators
   - [ ] Content freshness badges
   - [ ] Session expiry handling

**Expected Result:** All documentation accessible and current.

---

## 🎯 FINAL SIGN-OFF

### Summary

Total tests: **57 individual checks**

After completing all test suites, fill in:

- **Date Tested:** _________________
- **Tester Name:** _________________
- **Browser(s) Tested:** _________________
- **Issues Found:** _________________
- **Critical Issues:** ☐ None / ☐ Some
- **Ready for Production:** ☐ Yes / ☐ No

### Sign-Off

**I certify that all features have been tested and the application is ready for production use.**

- Signature: _________________________________
- Date: _________________________________

---

## 📞 TROUBLESHOOTING

If you encounter issues:

1. **Check browser console for errors** (F12 → Console)
2. **Clear browser cache** and retry
3. **Try in incognito mode**
4. **Check internet connection**
5. **Contact support** if issues persist

---

**END OF USER FRONTEND TEST CHECKLIST**

All 57 tests should pass before project handoff.
