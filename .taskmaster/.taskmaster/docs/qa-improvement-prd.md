# Upday QA Improvement PRD

## Overview
This PRD outlines quality assurance improvements for updayapp.com website. All tasks must preserve existing functionality and visual design.

## Constraints
- **DO NOT** modify existing working features
- **DO NOT** change UI styling or visual elements
- **ADD ONLY** - use additive approach to improvements
- All tasks should be tagged with `qa-improvement`

---

## Phase 1: Critical Navigation & Routing Issues

### Task: Replace window.location.href with React Router Link
**Priority**: High
**File**: `upday/src/pages/LandingPage.tsx`

Replace all `window.location.href` calls with React Router's `Link` component or `useNavigate` hook to prevent full page reloads and enable SPA navigation.

**Acceptance Criteria**:
- All internal navigation uses React Router
- No full page reloads on internal links
- Existing link destinations unchanged

### Task: Implement URL State Synchronization
**Priority**: High
**File**: `upday/src/pages/TimelinePage.tsx`

Sync category filter and search query with URL parameters using `useSearchParams` from react-router-dom. Users should be able to share URLs that restore the same filter/search state.

**Acceptance Criteria**:
- Category selection updates URL (e.g., `/timeline?category=ai`)
- Search query updates URL (e.g., `/timeline?q=chatgpt`)
- Page load reads URL params and applies filters
- Browser back/forward works correctly

### Task: Implement 404 Not Found Page
**Priority**: High
**Files**: `upday/src/pages/NotFoundPage.tsx` (new), `upday/src/App.tsx`

Create a user-friendly 404 page for unknown routes.

**Acceptance Criteria**:
- Clean, minimal design matching existing style
- Link to return to homepage
- Catch-all route in App.tsx

---

## Phase 2: Accessibility Improvements

### Task: Add ARIA Labels to Interactive Elements
**Priority**: High
**Files**: `upday/src/components/layout/Header.tsx`, `upday/src/components/news/FilterBar.tsx`

Add proper ARIA labels for screen readers.

**Acceptance Criteria**:
- Search input has `aria-label`
- Filter buttons have `aria-label` or use visible text
- Mobile search button has `aria-label`
- Theme toggle has `aria-label`

### Task: Add aria-pressed State to FilterBar Buttons
**Priority**: Medium
**File**: `upday/src/components/news/FilterBar.tsx`

Add `aria-pressed` attribute to category filter buttons.

**Acceptance Criteria**:
- Active category button has `aria-pressed="true"`
- Inactive buttons have `aria-pressed="false"`
- Screen readers announce selected state

### Task: Add Skip-to-Content Link
**Priority**: Medium
**File**: `upday/src/App.tsx` or layout component

Add a skip link for keyboard users to bypass navigation.

**Acceptance Criteria**:
- Visually hidden but accessible via keyboard
- First focusable element on page
- Skips to main content area

### Task: Fix Mobile Search Focus Management
**Priority**: Medium
**File**: `upday/src/components/layout/Header.tsx`

Improve focus trap and management in mobile search overlay.

**Acceptance Criteria**:
- Focus moves to input when overlay opens
- Focus returns to trigger when overlay closes
- Escape key closes overlay
- Tab cycling stays within overlay

### Task: Add Live Region for Dynamic Content
**Priority**: Low
**File**: `upday/src/components/news/TimelineFeed.tsx`

Announce content changes to screen readers.

**Acceptance Criteria**:
- Loading state announced
- Results count announced
- Error states announced
- Uses `role="status"` or `aria-live`

---

## Phase 3: UX/UI Functional Improvements

### Task: Add Mobile Search Overlay Animation
**Priority**: Low
**File**: `upday/src/components/layout/Header.tsx`

Add smooth transition animation when mobile search overlay opens/closes.

**Acceptance Criteria**:
- Fade in/out animation
- Uses CSS transitions (no layout shift)
- Respects reduced motion preferences

### Task: Add FilterBar Scroll Indicators
**Priority**: Low
**File**: `upday/src/components/news/FilterBar.tsx`

Show visual indicators when FilterBar can be scrolled horizontally.

**Acceptance Criteria**:
- Fade gradient on edges when scrollable
- Indicators update on scroll
- Only shows when content overflows

### Task: Add Scroll-to-Top Button
**Priority**: Medium
**File**: `upday/src/pages/TimelinePage.tsx`

Add a floating button to scroll back to top when user scrolls down.

**Acceptance Criteria**:
- Appears after scrolling 300px+
- Smooth scroll to top on click
- Accessible button with label
- Doesn't obstruct content

### Task: Implement Infinite Scroll
**Priority**: Medium
**File**: `upday/src/components/news/TimelineFeed.tsx`

Replace "Load more" button with automatic infinite scroll.

**Acceptance Criteria**:
- Loads more when near bottom (IntersectionObserver)
- Shows loading indicator while fetching
- Graceful fallback if observer not supported
- Load more button still works as fallback

---

## Phase 4: Missing Static Pages

### Task: Create About Page
**Priority**: Medium
**File**: `upday/src/pages/AboutPage.tsx` (new)

Create an About page with honest, concise content about Upday.

**Content Guidelines**:
- Service introduction: AI-powered news aggregation
- Technology: AI summarization (factual, not exaggerated)
- Mission: Help users stay informed efficiently
- Keep it simple and honest

### Task: Create Feedback Page
**Priority**: Medium
**File**: `upday/src/pages/FeedbackPage.tsx` (new)

Create a feedback submission page.

**Content**:
- Simple feedback form (email, message)
- Form validation
- Thank you state after submission
- Contact information

### Task: Create Diversity Page
**Priority**: Low
**File**: `upday/src/pages/DiversityPage.tsx` (new)

Create a page explaining news source diversity principles.

**Content Guidelines**:
- Multiple source inclusion policy
- Balanced perspective approach
- No political bias statement
- Source selection criteria

### Task: Create Ethics Page
**Priority**: Low
**File**: `upday/src/pages/EthicsPage.tsx` (new)

Create an AI ethics and editorial guidelines page.

**Content Guidelines**:
- AI summarization transparency
- Original source attribution
- No content modification policy
- User responsibility disclaimer

---

## Phase 5: Performance Optimizations

### Task: Implement Virtual Scrolling for Long Lists
**Priority**: Low
**File**: `upday/src/components/news/TimelineFeed.tsx`

Use virtualization for better performance with many news items.

**Acceptance Criteria**:
- Only renders visible items + buffer
- Smooth scrolling maintained
- Correct scroll height
- Date separators work correctly

### Task: Add Image Placeholder Loading
**Priority**: Low
**File**: `upday/src/components/news/NewsCard.tsx`

Show placeholder while images load.

**Acceptance Criteria**:
- Skeleton/placeholder shown while loading
- Smooth transition to loaded image
- Handles load errors gracefully
- No layout shift

---

## Phase 6: Technical Improvements

### Task: Persist Theme Preference to localStorage
**Priority**: Medium
**File**: `upday/src/components/ui/ThemeProvider.tsx`

Ensure theme selection persists across sessions.

**Acceptance Criteria**:
- Theme saved to localStorage
- Theme restored on page load
- Respects system preference if no saved value

### Task: Add Share Functionality to News Cards
**Priority**: Low
**File**: `upday/src/components/news/NewsCard.tsx`

Add ability to share news items.

**Acceptance Criteria**:
- Share button (not always visible, on hover/focus)
- Uses Web Share API if available
- Fallback to copy link
- Shares article title and original source URL
