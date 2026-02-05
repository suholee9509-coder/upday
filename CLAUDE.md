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
- `usePinnedCompanies` - manage pinned companies in localStorage
- `useSearchHistory` - manage search history in localStorage
- `useToast` - toast notification system
- `useCommandPalette` - access command palette state
- `useNews` - news fetching with pagination, includes `jumpToDate` for instant date navigation

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
│   ├── CommandPalette.tsx
│   ├── CompanyLogo.tsx
│   └── UpdayLogo.tsx      # UpdayLogo (symbol) + UpdayWordmark (symbol + text)
├── hooks/
│   ├── usePinnedCompanies.ts
│   ├── useSearchHistory.ts
│   └── useToast.tsx
├── pages/
│   ├── TimelinePage.tsx
│   ├── CompanyBrowserPage.tsx
│   ├── CategoryPage.tsx
│   ├── LandingPage.tsx
│   ├── FeedbackPage.tsx    # 피드백 폼 (Resend 이메일)
│   └── RedirectPage.tsx    # 트래킹 리다이렉트 (/go?url=...)
├── lib/
│   ├── utils.ts         # cn() utility function
│   ├── constants.ts     # COMPANIES, CATEGORIES
│   ├── db.ts            # Supabase client
│   ├── company-relevance.ts  # Company relevance scoring (keyword matching)
│   └── rss-feeds.ts     # RSS feed configuration
├── public/
│   ├── favicon.svg      # upday logo (same as UpdayLogo symbol)
│   └── logos/           # Company SVG logos (25 files)
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
