# Claude Code Instructions

## Design System Rules

### UI Components Location
All UI components are in `src/components/ui/`. **ALWAYS use existing components instead of creating new ones.**

**Available Components:**
- `Button` - variants: primary, secondary, ghost, destructive, outline / sizes: sm, default, lg, icon
- `Badge` - variants: default, secondary, destructive, outline, muted
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Input`
- `Skeleton`
- `ThemeProvider`, `ThemeToggle`
- `Toast`, `Toaster` - toast notifications system
- `BottomSheet` - mobile bottom sheet component

**Import Pattern:**
```tsx
import { Button, Badge, Card, Input, ThemeToggle } from '@/components/ui'
import { cn } from '@/lib/utils'
```

### Layout Components
Layout components are in `src/components/layout/`.

**Available Components:**
- `Header` - GNB with search trigger, theme toggle
- `Sidebar` - collapsible sidebar with pinned companies
- `SidebarProvider` - context provider for sidebar state
- `MobileMenuButton` - hamburger menu for mobile

**Import Pattern:**
```tsx
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
```

### Feature Components
- `CommandPalette` - global search (⌘K), includes `CommandPaletteProvider`
- `CompanyLogo` - renders company logo SVG or fallback
- `UpdayLogo` - upday logo symbol only
- `UpdayWordmark` - upday logo symbol + text combined

### Custom Hooks
- `usePinnedCompanies` - manage pinned companies (localStorage + Supabase sync, requires login)
- `useSearchHistory` - manage search history in localStorage
- `useToast` - toast notification system
- `useCommandPalette` - access command palette state
- `useNews` - news fetching with pagination, includes `jumpToDate` for instant date navigation
- `useAuth` - authentication state management (Supabase Auth with OAuth)
- `useUserInterests` - user interests management (categories, keywords, companies)
- `useMyFeed` - personalized feed with importance scoring and clustering

### Date Navigation System

날짜 드롭다운과 스크롤 연동 시스템:

**Components:**
- `DateDropdown` - 최근 7일 날짜 선택 드롭다운
- `FilterBar` - 카테고리 필터 + 날짜 드롭다운 (우측)
- `CompanyFeedHeader` - 회사 정보 + 날짜 드롭다운 (우측)
- `TimelineFeed` - 날짜별 그룹핑, 스크롤 감지, 날짜 점프

**Data Flow:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page (TimelinePage / CategoryPage)                         │
│  - currentDate state                                        │
│  - useNews({ jumpToDate })                                  │
└────────────────┬──────────────────────┬─────────────────────┘
                 │                      │
    ┌────────────▼────────────┐   ┌─────▼──────────────────────┐
    │  FilterBar/CompanyHeader │   │  TimelineFeed              │
    │  - DateDropdown          │   │  - onVisibleDateChange     │
    │  - onDateSelect ─────────┼───│  - scrollToDate (via ref)  │
    └──────────────────────────┘   │  - onJumpToDate            │
                                   └──────────────────────────────┘
```

**스크롤 → 드롭다운 업데이트:**
- IntersectionObserver가 화면 상단의 DateSeparator 감지
- `onVisibleDateChange` 콜백으로 currentDate 업데이트
- 드롭다운 텍스트 자동 변경 (Today, Yesterday, Feb 4 등)

**드롭다운 → 스크롤 이동:**
- 날짜 선택 시 `timelineFeedRef.current.scrollToDate(date)` 호출
- 이미 로드된 날짜: 즉시 `scrollIntoView`
- 미로드 날짜: `jumpToDate`로 해당 날짜 데이터 직접 fetch → 병합 → 스크롤

**jumpToDate 구현 (useNews):**
```tsx
// 중간 페이지 로드 없이 특정 날짜로 즉시 점프
const jumpToDate = async (targetDate: Date) => {
  // 타겟 날짜+1일을 cursor로 사용 (해당 날짜 포함)
  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const jumpCursor = nextDay.toISOString()

  // 해당 cursor부터 데이터 fetch
  const result = await fetchNews({ cursor: jumpCursor, ... })

  // 기존 데이터와 병합 (중복 제거, 날짜순 정렬)
  setItems(prev => {
    const merged = [...prev, ...newItems]
    merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    return merged
  })
}
```

**Usage:**
```tsx
const { items, loadMore, jumpToDate } = useNews({ category })
const timelineFeedRef = useRef<TimelineFeedRef>(null)
const [currentDate, setCurrentDate] = useState(new Date())

// FilterBar에서 날짜 선택
const handleDateSelect = (date: Date) => {
  setCurrentDate(date)
  timelineFeedRef.current?.scrollToDate(date)
}

// 스크롤 시 날짜 업데이트
const handleVisibleDateChange = (date: Date) => {
  setCurrentDate(date)
}

<FilterBar currentDate={currentDate} onDateSelect={handleDateSelect} />
<TimelineFeed
  ref={timelineFeedRef}
  onJumpToDate={jumpToDate}
  onVisibleDateChange={handleVisibleDateChange}
/>
```

### Company Logos
25 company logos are stored in `public/logos/` as SVG files.

**Available Logos:**
amazon, anthropic, apple, cloudflare, cursor, databricks, discord, figma, github, google, linear, meta, microsoft, mistral, notion, nvidia, openai, reddit, shopify, slack, stripe, supabase, tesla, vercel, xai

**Usage:**
```tsx
import { CompanyLogo } from '@/components/CompanyLogo'

<CompanyLogo companyId="openai" size="md" />
// sizes: xs (16px), sm (20px), md (24px), lg (40px)
```

### upday Logo
Two logo components for different use cases:

**UpdayLogo** - Symbol only (for favicon, icon contexts)
```tsx
import { UpdayLogo } from '@/components/UpdayLogo'

<UpdayLogo size="sm" />
// sizes: sm (20px), md (24px), lg (32px), xl (48px), 2xl (61px)
```

**UpdayWordmark** - Symbol + "upday" text (for headers, navigation)
```tsx
import { UpdayWordmark } from '@/components/UpdayLogo'

<UpdayWordmark size="sm" />
// sizes: sm (20px symbol + text-base), md (24px symbol + text-xl)
```

**Usage Guidelines:**
- Use `UpdayWordmark` for navigation headers (LandingPage GNB, Sidebar)
- Use `UpdayLogo` for standalone symbol contexts (favicon already uses this design)
- Both components use `fill-foreground` for automatic theme adaptation

## Authentication & User Management

### OAuth Authentication
- **Providers**: GitHub, Google OAuth only (no email/password)
- **Library**: Supabase Auth
- **Login Triggers**: My Feed tab click, Pin button click
- **Post-login**: Interest onboarding (first time only)

### User Data
```typescript
// Supabase tables
- profiles: user profile (linked to auth.users)
- user_interests: categories, keywords, companies, onboarding_completed
- pinned_companies: user's pinned companies (server-synced)
```

### Components
- `LoginModal` - OAuth login modal (GitHub/Google)
- `OnboardingModal` - first-time interest setup
- `OnboardingManager` - auto-show onboarding after first login

### ⚠️ Critical: Authentication Guard Pattern

**모달/기능을 인증 사용자에게만 표시할 때 반드시 지켜야 할 패턴:**

```typescript
// ❌ WRONG: 미인증 시 false 반환 → 모달이 미인증 사용자에게 표시됨
hasCompletedOnboarding: interests?.onboarding_completed ?? false

// ✅ CORRECT: 미인증 시 true 반환 → 조건 !hasCompletedOnboarding이 false가 됨
hasCompletedOnboarding: isAuthenticated ? (interests?.onboarding_completed ?? false) : true
```

**OnboardingManager 패턴:**
```typescript
useEffect(() => {
  if (authLoading || interestsLoading) return

  // 1. 먼저 인증 여부 확인 - 미인증이면 즉시 반환
  if (!isAuthenticated) {
    setShowOnboarding(false)
    return
  }

  // 2. 인증된 사용자만 온보딩 필요 여부 확인
  if (!hasCompletedOnboarding && !hasChecked) {
    setShowOnboarding(true)
  }
}, [isAuthenticated, hasCompletedOnboarding, ...])
```

**핵심 원칙:**
1. `isAuthenticated` 체크를 **항상 먼저** 수행
2. Boolean 기본값 설정 시 미인증 케이스 고려 (true/false 중 어느 것이 안전한지)
3. Optional chaining (`?.`) + nullish coalescing (`??`) 사용 시 미인증 상태의 반환값 확인

### Pin Sync Migration
- **Non-authenticated**: localStorage only
- **Authenticated**: Supabase sync
- **On login**: Auto-migrate localStorage pins to server → clear localStorage
- **Pin/Unpin**: Requires login (shows login modal if not authenticated)

### Protected Routes
- `/timeline/my` - My Feed (requires login)
- `/settings` - Settings page (requires login)

## My Feed (Personalized Timeline)

### Overview
개인화된 뉴스 피드로, 사용자 관심사 기반으로 중요한 뉴스를 **주 단위**로 제공.

### Architecture
```
User Interests → Filter News → Score → Cluster → Group by Week → Display
```

### Importance Scoring (0-100점)
```typescript
// src/lib/importance.ts
- Category match: 30점
- Keyword match: 25점 (최대, 키워드당 10점)
- Company match: 20점
- Tier-1 company: 15점 (OpenAI, Google 등)
- Funding/M&A: 10점 ($50M+, acquisition 키워드)
- Product launch: 10점 (launch, release, announce 키워드)
- Multi-source boost: +20% (3+ 소스에서 동일 이벤트)
```

**Display Threshold**: 40점 이상만 표시

### News Clustering
```typescript
// src/lib/clustering.ts
- 같은 이벤트 기사 자동 그룹화
- 유사도 계산: 제목 단어 매칭, 카테고리, 회사, 시간 근접성 (48시간)
- 대표 기사 1개 + 관련 기사 N개
- Similarity threshold: 0.4 (40%)
```

### Weekly Timeline
- **범위**: 최근 12주
- **네비게이션**: 주간 타임라인 바 (가로 스크롤)
- **기본 선택**: 현재 주 (Week 0)
- **주 라벨**: "1/20-26" 또는 "1/27-2/2" 형식

### Components
- `WeeklyBar` - 주간 타임라인 바 (12주 가로 스크롤)
- `MyFeedPage` - 메인 페이지 (클러스터 뷰, 확장/축소)
- Hook: `useMyFeed` - 데이터 fetching, filtering, scoring, clustering, grouping

### Data Flow
```
1. useUserInterests → 사용자 관심사 가져오기
2. fetchNews → 최근 12주 뉴스 로드 (배치)
3. matchesUserInterests → 카테고리/키워드/회사 필터링
4. calculateImportanceScore → 각 기사 점수 계산
5. filterByImportance → 40점 이상만 필터링
6. clusterNews → 관련 기사 그룹화
7. groupByWeeks → 주 단위 그룹화
8. Display → WeeklyBar + ClusterCards
```

### Usage
```tsx
const { weeks, currentWeek, selectWeek } = useMyFeed()

<WeeklyBar weeks={weeks} onSelectWeek={selectWeek} />
{currentWeek.clusters.map(cluster => (
  <ClusterCard key={cluster.id} cluster={cluster} />
))}
```

### Styling Rules
- Use `cn()` from `@/lib/utils` for class merging
- Use design tokens defined in `src/index.css` (oklch-based light/dark theme)
- Follow Monet theme naming conventions: `bg-background`, `text-foreground`, `border-border`, etc.
- Do NOT use shadcn/ui CLI to add new components - manually create matching the existing style
- Pin icon should use `rotate-45` and `strokeWidth={1.5}` for consistency

### Button Arrow Animation
For CTA buttons with arrow icons, use the `group` + `group-hover:translate-x-1` pattern for hover interaction:

```tsx
import { ArrowRight } from 'lucide-react'

// Add `group` class to Button, and animation classes to ArrowRight
<Button className="group" onClick={handleClick}>
  Button text
  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
</Button>
```

This creates a subtle arrow slide effect on hover, indicating clickability.

### Global Gradient Pattern
For landing pages with flowing gradient backgrounds, use absolute positioned blobs in a container that spans the entire page. This prevents gradients from being clipped at section boundaries:

```tsx
<div className="min-h-screen bg-background relative overflow-x-hidden">
  {/* Global gradient container - spans entire page */}
  <div className="absolute inset-0 pointer-events-none">
    {/* Position blobs at different vertical positions */}
    <div className="absolute -top-40 right-0 w-[900px] h-[900px] bg-gradient-to-bl from-rose-100/60 via-violet-100/40 to-transparent dark:from-primary/[0.09] dark:via-primary/[0.05] rounded-full blur-3xl" />
    {/* Use one large blob to span multiple sections for seamless continuity */}
    <div className="absolute top-[1400px] left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] bg-gradient-to-b from-amber-100/30 via-rose-100/25 to-violet-100/20 dark:from-muted/25 dark:via-primary/[0.04] dark:to-muted/15 rounded-full blur-3xl" />
  </div>

  {/* Content sections with relative z-index */}
  <section className="relative">...</section>
</div>
```

**Key principles:**
- Light mode: Use color shades like `rose-100/60`, `violet-100/40`, `amber-100/30`
- Dark mode: Use design tokens with low opacity like `primary/[0.09]`, `muted/25`
- Use `blur-3xl` and `rounded-full` for soft edges
- For continuous areas across multiple sections, use one large blob instead of multiple smaller ones

### Theme Transition
The app uses `disableTransitionOnChange` in ThemeProvider to ensure instant theme switching without staggered animations:

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
```

### Project Structure
```
src/
├── components/
│   ├── ui/              # Base UI components (Monet theme)
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Toast.tsx
│   │   ├── Toaster.tsx
│   │   ├── BottomSheet.tsx
│   │   └── index.js
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   ├── news/            # News-related components
│   │   ├── NewsCard.tsx
│   │   ├── TimelineFeed.tsx
│   │   ├── CompanyFeedHeader.tsx
│   │   └── DateDropdown.tsx
│   ├── timeline/        # Timeline-specific components
│   │   └── WeeklyBar.tsx       # My Feed 주간 네비게이션 바
│   ├── auth/            # Authentication components
│   │   ├── LoginModal.tsx      # OAuth 로그인 모달
│   │   ├── OnboardingModal.tsx # 첫 로그인 시 관심사 설정
│   │   ├── OnboardingManager.tsx # 온보딩 트리거
│   │   └── index.ts
│   ├── CommandPalette.tsx
│   ├── CompanyLogo.tsx
│   └── UpdayLogo.tsx      # UpdayLogo (symbol) + UpdayWordmark (symbol + text)
├── hooks/
│   ├── useAuth.ts           # Supabase Auth (OAuth)
│   ├── useUserInterests.ts  # 사용자 관심사 관리
│   ├── useMyFeed.ts         # My Feed 데이터 (scoring + clustering)
│   ├── usePinnedCompanies.ts # Pin 관리 (localStorage + Supabase sync)
│   ├── useSearchHistory.ts
│   └── useToast.tsx
├── pages/
│   ├── TimelinePage.tsx
│   ├── MyFeedPage.tsx       # 개인화 피드 (로그인 필요)
│   ├── SettingsPage.tsx     # 계정 및 관심사 설정
│   ├── CompanyBrowserPage.tsx
│   ├── CategoryPage.tsx
│   ├── LandingPage.tsx
│   ├── FeedbackPage.tsx     # 피드백 폼 (Resend 이메일)
│   └── RedirectPage.tsx     # 트래킹 리다이렉트 (/go?url=...)
├── lib/
│   ├── utils.ts         # cn() utility function
│   ├── constants.ts     # COMPANIES, CATEGORIES
│   ├── db.ts            # Supabase client
│   ├── company-relevance.ts  # Company relevance scoring (keyword matching)
│   ├── importance.ts    # Importance scoring algorithm (0-100점)
│   ├── clustering.ts    # News clustering (같은 이벤트 그룹화)
│   └── rss-feeds.ts     # RSS feed configuration
├── types/
│   └── news.ts          # TypeScript types (NewsItem, Category, Company)
├── public/
│   ├── favicon.svg      # upday logo (same as UpdayLogo symbol)
│   └── logos/           # Company SVG logos (25 files)
├── scripts/
│   └── schema-auth.sql  # Supabase Auth 스키마 (user_interests, pinned_companies)
└── index.css            # Design system CSS variables
```

## Categories

5개 카테고리: `ai`, `startups`, `dev`, `product`, `research`

| Category | Coverage |
|----------|----------|
| ai | AI, LLM, ML, generative AI |
| startups | Funding, M&A, entrepreneurship |
| dev | Programming, open source, DevOps |
| product | UX/Product Strategy, 제품 전략, 마케팅, 디자인 시스템 |
| research | Scientific research, papers, space |

**Product 카테고리 소스 (8개):**
- Product Hunt, Nielsen Norman Group, Intercom Blog, UX Collective, UX Planet, A List Apart, Smashing Magazine, HubSpot Marketing
- 타겟: PM, 개발자, 투자자, 창업가를 위한 UX/제품 전략 콘텐츠
- 제외: 소비재 뉴스 (피자헛, 치토스 등), 건축/인테리어 (Dezeen, Designboom)

## Supabase Database Schema

### News Tables
- `news_items` - 뉴스 기사 메인 테이블
  - columns: id, title, summary, body, category, companies[], source, source_url, image_url, published_at
  - indexes: published_at (DESC), category, companies (GIN), full-text search

### Auth Tables (scripts/schema-auth.sql)
- `profiles` - 사용자 프로필 (auth.users 연결)
  - columns: id, name, avatar_url, provider
  - RLS: users can read/update own profile

- `user_interests` - 사용자 관심사 (My Feed용)
  - columns: user_id, categories[], keywords[], companies[], onboarding_completed
  - constraint: categories not empty (최소 1개 필수)
  - RLS: users can read/insert/update own interests

- `pinned_companies` - 핀 회사 (서버 동기화)
  - columns: user_id, company_slug, pinned_at
  - unique: (user_id, company_slug)
  - RLS: users can read/insert/delete own pins

### Triggers
- `handle_new_user()` - 회원가입 시 profiles 자동 생성
- `update_updated_at()` - profiles, user_interests 수정 시 updated_at 업데이트

### Setup
```bash
# 스키마 적용
npx supabase db push

# 또는 SQL Editor에서 직접 실행
# 1. scripts/schema.sql (news_items)
# 2. scripts/schema-auth.sql (auth tables)
```

## Company Tagging

- 키워드 매칭 기반 회사 태깅 (AI API 미사용)
- 크롤링 시 `companies` 배열에 자동 태깅
- 프론트엔드에서 relevance 스코어링으로 필터링 (threshold: 50점)

**지원 회사 (25개):**
openai, anthropic, google, microsoft, meta, nvidia, xai, mistral, vercel, supabase, cloudflare, linear, figma, notion, cursor, github, databricks, apple, amazon, tesla, stripe, shopify, slack, discord, reddit

## Language Filtering

- 영어 기사만 크롤링 (글로벌 타겟)
- 중국어, 일본어, 한국어, 러시아어, 아랍어 등 비라틴 문자 기사 자동 필터링
- `isEnglishContent()` 함수로 타이틀의 10% 이상이 비라틴 문자면 스킵
- Dev.to 등 다국어 플랫폼에서 비영어 기사 유입 방지

## Category Keyword Filtering

- 일반 테크 피드(Engadget, Gizmodo, CNET 등)에서 카테고리와 무관한 기사 필터링
- 카테고리별 필수 키워드 정의 (`CATEGORY_KEYWORDS`)
- 카테고리 전용 소스는 필터링 스킵 (`CATEGORY_SPECIFIC_SOURCES`)

| Category | 필수 키워드 예시 |
|----------|------------------|
| ai | ai, machine learning, llm, gpt, openai, neural network |
| startups | startup, funding, series a, vc, acquisition, founder |
| dev | developer, api, framework, github, kubernetes, react |
| product | ux, product design, growth, analytics, saas, pmf |
| research | research, paper, nasa, space, quantum, scientific |

## SEO Configuration

### Search Engine Registration

**Status:**
- ✅ Google Search Console - Verified
- ✅ Naver Search Advisor - Verified (2026-02-05)
- ✅ Bing Webmaster Tools - Verified (via GSC import)

**Verification Tags (index.html):**
```html
<meta name="google-site-verification" content="ok6zTvWVtTnnjqE0vSitYIvplZHUKlr3sDTrN7RM23I" />
<meta name="naver-site-verification" content="857faaa983a39204542e17a3bbedcf1f4fccc52f" />
<!-- Bing: No tag needed (GSC import) -->
```

### Sitemaps

**Submitted URLs:**
- `https://updayapp.com/sitemap.xml` - Main sitemap (10 URLs)
- `https://updayapp.com/news-sitemap.xml` - News sitemap

**robots.txt Configuration:**
```txt
# Google, Bing, Naver bot rules configured
User-agent: Googlebot
User-agent: Bingbot
User-agent: Yeti  # Naver bot

Sitemap: https://updayapp.com/sitemap.xml
Sitemap: https://updayapp.com/news-sitemap.xml
```

### Indexing Timeline

| Search Engine | Crawling | Indexing | Search Visibility |
|---------------|----------|----------|-------------------|
| Google | 1-7 days | 1-2 weeks | 2-4 weeks |
| Naver | 3-14 days | 2-4 weeks | 4-8 weeks |
| Bing | 3-14 days | 2-4 weeks | 4-8 weeks |

**Check Indexing Status:**
```
site:updayapp.com
```

### SEO Best Practices Applied

- ✅ Meta descriptions (210 chars, keyword-rich)
- ✅ Open Graph tags (og:image, og:title, og:description)
- ✅ Twitter Cards (summary_large_image)
- ✅ Structured data (WebSite, NewsMediaOrganization, CollectionPage)
- ✅ hreflang tags (en, ko, x-default)
- ✅ Canonical URLs
- ✅ robots.txt with sitemap declarations
- ✅ HSTS headers (max-age=31536000)
- ✅ Favicon optimization (ICO format)

## Cloudflare Workers

| Worker | 역할 | 배포 명령어 |
|--------|------|------------|
| `upday` | 메인 웹사이트 (정적 파일) | `wrangler deploy` |
| `upday-ingest` | 뉴스 RSS 크롤링 (4시간마다) | `wrangler deploy -c wrangler-ingest.toml` |
| `upday-feedback` | 피드백 이메일 API (Resend) | `wrangler deploy -c wrangler-feedback.toml` |

## Social Media Auto-Posting

3개 채널 자동 포스팅 (GitHub Actions, 30분마다):
- **Bluesky**: @updayapp.bsky.social
- **Discord**: https://discord.gg/GUkAsmpa
- **Telegram**: @updayapp

**필요한 GitHub Secrets:**
- `BLUESKY_IDENTIFIER`, `BLUESKY_APP_PASSWORD`
- `DISCORD_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`

**트래킹 URL 구조:**
- 소셜 미디어 링크: `https://updayapp.com/go?url={originalUrl}`
- RedirectPage에서 트래픽 기록 후 원본 URL로 리다이렉트

## Git Security & Hygiene

### Pre-commit Hook
A pre-commit hook (`.githooks/pre-commit`) automatically blocks sensitive files from being committed. It is auto-configured on `npm install` via the `prepare` script (`git config core.hooksPath .githooks`).

### Files That Must NEVER Be Committed
| Pattern | Reason |
|---------|--------|
| `.env`, `.env.*` | API keys, secrets (Supabase, Anthropic, OpenAI, etc.) |
| `.claude/` | Claude Code local settings |
| `ref/` | Internal design reference screenshots |
| `prd.txt` | Internal PRD document |
| `docs/prompts.md` | Internal prompt notes |
| `DESIGN_BRIEF*.md` | Internal design briefs |
| `*.local` | Local-only config files |

### If Pre-commit Hook Blocks Your Commit
```bash
# Unstage the blocked file
git reset HEAD <file>

# If the file should be permanently ignored, add to .gitignore
echo "<file>" >> .gitignore
```

### After Accidentally Committing Secrets
1. **Immediately rotate all exposed keys** (even in private repos)
2. Remove from history: `git filter-repo --invert-paths --path <file> --force`
3. Force push: `git push --force-with-lease`

## Useful Commands

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 시드 데이터
npm run seed

# 크롤링 모니터링 (기사 통계 확인)
npm run monitor

# 회사 태그 백필 (기존 기사에 companies 태그 추가)
npm run backfill:companies

# 회사 태그 백필 드라이런 (변경 없이 미리보기)
npm run backfill:companies:dry

# 이미지 백필 (기존 기사에 og:image 추가)
npm run backfill:images

# 이미지 백필 드라이런 (변경 없이 미리보기)
npm run backfill:images:dry

# 타이틀 백필 (빈 타이틀 기사에 og:title 추가)
npm run backfill:titles

# 타이틀 백필 드라이런 (변경 없이 미리보기)
npm run backfill:titles:dry

# 날짜 백필 (잘못된 published_at 수정)
npm run backfill:dates

# 날짜 백필 드라이런 (변경 없이 미리보기)
npm run backfill:dates:dry

# 소셜 미디어 자동 포스팅
npm run bluesky:post      # Bluesky 실제 포스팅
npm run bluesky:dry-run   # Bluesky 드라이런
npm run discord:post      # Discord 실제 포스팅
npm run discord:dry-run   # Discord 드라이런
npm run telegram:post     # Telegram 실제 포스팅
npm run telegram:dry-run  # Telegram 드라이런

# Workers 배포
wrangler deploy                           # 메인 사이트
wrangler deploy -c wrangler-ingest.toml   # 크롤링 워커
wrangler deploy -c wrangler-feedback.toml # 피드백 API

# Supabase 마이그레이션
npx supabase db push
```

---

## Internationalization (i18n)

Upday supports **Global (English) primary** and **Korean (한국어) secondary** languages.

### Language Support
- **Primary:** English (en) - Global audience
- **Secondary:** Korean (ko) - Korean users
- **Implementation:** Client-side language switching via localStorage
- **Library:** i18next + react-i18next

### Language Files
- `src/locales/en.json` - English translations
- `src/locales/ko.json` - Korean translations
- `src/lib/i18n.ts` - Language configuration and utilities

### Usage
```tsx
import { useTranslation } from 'react-i18next'
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n'

// In components
const { t } = useTranslation()
<h1>{t('welcome')}</h1>

// Get current language
const currentLang = getCurrentLanguage() // 'en' | 'ko'

// Change language
changeLanguage('ko') // Switches to Korean
```

### SEO Considerations
- `hreflang` tags in `index.html` include both `en` and `ko`
- Same URL serves both languages (client-side switching)
- Meta descriptions available in both languages via `CATEGORY_SEO`
- Social sharing always uses English (OG tags)

---

## SEO Configuration

### Recent Optimizations (2026-02-06)

**Cloudflare Crawler Hints:**
- Added `<meta name="cf-2fa-verify" content="none" />` to enable automatic pre-rendering for crawlers
- Solves React SPA empty HTML issue
- Immediate effect on crawlability

**Meta Tags Enhanced:**
- Improved meta description with specific keywords (OpenAI, Google, Microsoft, ChatGPT, Claude, Gemini)
- Fixed hreflang attributes (en, ko, x-default)
- Corrected structured data logo reference (og-image.png instead of non-existent logo.png)

**Pre-rendering Routes (vite.config.ts):**
```typescript
const PRERENDER_ROUTES = [
  '/',
  '/timeline',
  '/ai',
  '/startups',
  '/dev',
  '/product',
  '/research',
  '/about',
  '/timeline/companies',
]
```
- Fixed outdated category URLs
- Build with `PRERENDER=true npm run build` to enable

**Sitemap Updates (sitemap.xml):**
- **26 company pages** added: `/company/openai`, `/company/anthropic`, etc.
- Updated lastmod dates to 2026-02-06
- Total URLs: ~40 (homepage, timeline, 5 categories, 26 company pages, 4 static pages)

**robots.txt:**
- Fixed Host directive format: `updayapp.com` (not `https://updayapp.com`)
- Optimized crawl-delay settings for different bots
- Sitemaps: `sitemap.xml` and `news-sitemap.xml`

### Search Engine Registration
- ✅ Google Search Console - Verified
- ✅ Naver Search Advisor - Verified (2026-02-05)
- ✅ Bing Webmaster Tools - Verified (via GSC import)

### Structured Data
Implemented JSON-LD schemas:
- **WebSite** with SearchAction
- **NewsMediaOrganization** (Google News Publisher)
- **CollectionPage** for category/company pages
- **NewsArticle** for individual news items (via `injectNewsArticleSchema`)
- **BreadcrumbList** for navigation

### Future Improvements
Consider implementing:
- Dynamic sitemap worker (Cloudflare Workers) to include latest news URLs
- FAQ sections on category pages for Google Discover
- Internal linking strategy (currently external links only)
- Bundle size optimization and lazy loading improvements

---
