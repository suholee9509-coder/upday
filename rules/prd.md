# Pulse - Timeline-Based Global News Platform PRD

## Product Summary

**Product Name:** Pulse  
**One-liner:** Understand the world's changes at a glance—without reading full articles.

---

## Problem Statement

### The News Paradox
The volume of news is overwhelming, but trends remain invisible.

**Current Pain Points:**
- Dozens of news stories pour in daily across tech, startups, science, and more
- Users want to quickly understand "what is changing right now"
- Existing services fragment news into isolated articles
- Headlines alone don't provide enough context
- Full articles require too much time and cognitive effort

**Result:**
- News is consumed, but change goes unrecognized
- Users miss important trends or feel overwhelmed
- Reading gets pushed aside with "I'll read it later" and ultimately missed

### High Entry Cost
Understanding news shouldn't require reading entire articles.

- Grasping the core requires reading the full article
- Determining importance is left to the user
- Recent news often lacks background context

---

## Solution

Pulse is a **timeline-based news platform** with **AI-generated summaries** that enables instant comprehension of global changes.

### Key Value Propositions

1. **Timeline-First Structure**
   - All news sorted chronologically, not by algorithms
   - Time-based information flow over category silos
   - Scroll to grasp recent developments at a glance

2. **Change-Focused Summaries**
   - AI-generated 2-3 line summaries per news item
   - Focus on "what happened and why it matters"
   - No opinions, interpretations, or excessive analysis
   - Understand without clicking through

3. **Field-Specific Filtering**
   - Categories: AI, Startups, Science, Design, Space, Tech
   - Filter by interest while maintaining chronological order
   - Cross-field view shows changes as one unified flow

4. **Keyword Search**
   - Search within our curated news database
   - Results always sorted by recency
   - Quick discovery of specific topics

---

## Target Users

### Primary Persona
**Tech-savvy Professionals**
- Startup founders, product managers, developers, investors
- Want to stay informed but time-constrained
- Value efficiency over depth
- Consume news in short bursts throughout the day

### User Characteristics
- Global English-speaking audience
- Mobile and desktop users
- Prefer scanning over deep reading
- Trust AI curation over manual selection

---

## Core Product Principles

### 1. Quick Comprehension
- Title + summary must be enough to understand the news
- No need to click through to original articles for basic understanding
- Optimized for 5-second scanning per news item

### 2. Information Restraint
- Exclude excessive explanation and opinion
- Focus on conveying change, not interpreting it
- Prioritize density management over feature expansion

### 3. Zero Friction
- No login, no signup, no settings
- Instant access upon arrival
- See the timeline immediately

---

## User Journey

```
Arrive → See timeline immediately → Scroll through news
→ (Optional) Filter by category
→ (Optional) Search keywords
→ Click "Read more" for deep dive (external link)
→ Return and continue browsing
```

**Entry Point:** Direct URL, no onboarding  
**Exit Point:** External article link or natural departure  
**Return Behavior:** Bookmark-friendly, stateless experience

---

## MVP Feature Definition

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Timeline Feed | Reverse chronological news display with date separators | P0 |
| AI Summaries | 2-3 line change-focused summaries | P0 |
| News Cards | Title, summary, category, source, timestamp, link | P0 |
| Category Filter | Single-select filtering (All, AI, Startups, etc.) | P1 |
| Search | Keyword search within news database | P1 |
| Infinite Scroll | Load more news on scroll | P1 |
| External Links | Click to read original article | P0 |

### News Card Content

Each news item displays:
- **Category Tag:** Single category (AI, Startups, Science, Design, Space, Tech)
- **Timestamp:** Relative time (e.g., "2 hours ago")
- **Title:** Headline conveying the core change (max 2 lines)
- **Summary:** AI-generated, 2-3 sentences on what happened and why it matters
- **Source:** Original publication name
- **Action:** "Read more" link to external article

### Categories
- All (default)
- AI
- Startups
- Science
- Design
- Space
- Tech

---

## Success Metrics

### Primary KPIs
- **Time to First Value:** < 3 seconds from landing to reading first summary
- **Scroll Depth:** Average news items viewed per session
- **Return Rate:** Users returning within 7 days

### Secondary KPIs
- External link click rate
- Filter usage rate
- Search usage rate
- Session duration

---

## What's NOT in MVP

Explicitly excluded from initial release:
- User accounts / authentication
- Bookmarking or saving articles
- Comments or social features
- Dark mode
- Article detail view within platform
- Personalization or AI recommendations
- Push notifications
- Offline support
- Multi-language support

---

## Technical Context (Brief)

**Stack:** React, TypeScript, Tailwind CSS
**Design System:** Monet 테마 기반 자체 디자인 시스템 (`@/components/ui`)
**컴포넌트 데모:** `/components` 경로에서 확인 가능  

```typescript
interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: 'ai' | 'startups' | 'science' | 'design' | 'space' | 'tech';
  source: string;
  sourceUrl: string;
  publishedAt: string;
}
```

---

## Design Guidelines

- Use existing design system components only
- Prioritize readability and scannability
- Generous whitespace, subtle borders
- Mobile-responsive layout

---

## References

Visual inspiration:
- Linear.app changelog (clean, scannable)
- Notion page lists (card-based, minimal)
- Hacker News information density with modern aesthetics