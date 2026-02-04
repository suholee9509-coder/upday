# Upday Design System Spec v1.0
# Last Updated: 2026-02-04

---

## Overview

이 문서는 upday 서비스의 디자인 시스템을 정의합니다.
디자이너와 개발자가 일관된 UI를 구현하기 위한 단일 참조 문서입니다.

**관련 파일:**
- CSS Variables: `upday/src/index.css`
- Components: `upday/src/components/ui/`
- Types: `upday/src/types/news.ts`
- Constants: `upday/src/lib/constants.ts`

---

## 1. Foundations

### 1.1 Color Tokens

모든 색상은 oklch 색공간을 사용합니다. Light/Dark 모드 자동 전환을 지원합니다.

#### Semantic Colors

| Token | Light Mode | Dark Mode | 용도 |
|-------|------------|-----------|------|
| `--background` | oklch(1 0 0) | oklch(0.145 0 0) | 페이지 배경 |
| `--foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | 기본 텍스트 |
| `--card` | oklch(1 0 0) | oklch(0.205 0 0) | 카드 배경 |
| `--card-foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | 카드 텍스트 |
| `--primary` | oklch(0.205 0 0) | oklch(0.922 0 0) | 주요 액션 |
| `--primary-foreground` | oklch(0.985 0 0) | oklch(0.205 0 0) | 주요 액션 위 텍스트 |
| `--secondary` | oklch(0.97 0 0) | oklch(0.269 0 0) | 보조 액션 |
| `--secondary-foreground` | oklch(0.205 0 0) | oklch(0.985 0 0) | 보조 액션 위 텍스트 |
| `--muted` | oklch(0.97 0 0) | oklch(0.269 0 0) | 비활성/배경 |
| `--muted-foreground` | oklch(0.556 0 0) | oklch(0.708 0 0) | 보조 텍스트 |
| `--accent` | oklch(0.97 0 0) | oklch(0.269 0 0) | 강조 배경 |
| `--accent-foreground` | oklch(0.205 0 0) | oklch(0.985 0 0) | 강조 텍스트 |
| `--destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | 위험/삭제 |
| `--border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | 테두리 |
| `--input` | oklch(0.922 0 0) | oklch(1 0 0 / 15%) | 입력 필드 테두리 |
| `--ring` | oklch(0.708 0 0) | oklch(0.556 0 0) | 포커스 링 |

#### Sidebar Colors

| Token | Light Mode | Dark Mode | 용도 |
|-------|------------|-----------|------|
| `--sidebar` | oklch(0.985 0 0) | oklch(0.205 0 0) | 사이드바 배경 |
| `--sidebar-foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | 사이드바 텍스트 |
| `--sidebar-primary` | oklch(0.205 0 0) | oklch(0.488 0.243 264.376) | 사이드바 활성 |
| `--sidebar-accent` | oklch(0.97 0 0) | oklch(0.269 0 0) | 사이드바 호버 |
| `--sidebar-border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | 사이드바 구분선 |

#### Category Badge Colors

| Category | Light Mode | Dark Mode |
|----------|------------|-----------|
| `ai` | bg-purple-100, text-purple-800 | bg-purple-900/30, text-purple-300 |
| `startups` | bg-emerald-100, text-emerald-800 | bg-emerald-900/30, text-emerald-300 |
| `dev` | bg-blue-100, text-blue-800 | bg-blue-900/30, text-blue-300 |
| `product` | bg-orange-100, text-orange-800 | bg-orange-900/30, text-orange-300 |
| `research` | bg-cyan-100, text-cyan-800 | bg-cyan-900/30, text-cyan-300 |

---

### 1.2 Typography

Tailwind CSS 기본 타이포그래피 스케일을 사용합니다.

| Class | Size | Line Height | 용도 |
|-------|------|-------------|------|
| `text-xs` | 12px | 16px | 메타데이터, 타임스탬프 |
| `text-sm` | 14px | 20px | 본문, 요약 |
| `text-base` | 16px | 24px | 제목 (News Card) |
| `text-lg` | 18px | 28px | 섹션 제목 |
| `text-xl` | 20px | 28px | 페이지 제목 |
| `text-2xl` | 24px | 32px | Hero 서브타이틀 |
| `text-3xl` ~ `text-6xl` | 30px ~ 60px | - | Hero 타이틀 |

**Font Weights:**
- `font-normal` (400): 본문
- `font-medium` (500): 버튼, 배지
- `font-semibold` (600): 제목

**Font Features:**
```css
font-feature-settings: "rlig" 1, "calt" 1;
```

---

### 1.3 Spacing

Tailwind CSS 4px 기반 스케일을 사용합니다.

| Class | Value | 용도 |
|-------|-------|------|
| `gap-1` / `p-1` | 4px | 아이콘-텍스트 간격 |
| `gap-1.5` / `p-1.5` | 6px | 작은 버튼 내부 |
| `gap-2` / `p-2` | 8px | 기본 간격 |
| `gap-3` / `p-3` | 12px | 카드 내부 |
| `gap-4` / `p-4` | 16px | 섹션 간격 |
| `gap-6` / `p-6` | 24px | 카드 패딩 |
| `gap-8` / `p-8` | 32px | 큰 섹션 간격 |

---

### 1.4 Border Radius

| Token | Value | 용도 |
|-------|-------|------|
| `--radius` | 0.5rem (8px) | 기본값 |
| `--radius-sm` | 4px | 배지, 작은 요소 |
| `--radius-md` | 6px | 버튼 |
| `--radius-lg` | 8px | 카드, 입력 필드 |
| `--radius-xl` | 12px | 모달, 드롭다운 |
| `--radius-2xl` | 16px | 큰 카드 |

**Tailwind Classes:**
- `rounded-md`: 대부분의 컴포넌트
- `rounded-lg`: 카드

---

### 1.5 Shadows

| Level | Class | 용도 |
|-------|-------|------|
| Level 1 | `shadow-sm` | 버튼, 입력 필드 |
| Level 2 | `shadow` | 카드 기본 |
| Level 3 | `shadow-md` | 카드 호버 |
| Level 4 | `shadow-lg` | 드롭다운, 모달 |

---

## 2. Components

### 2.1 Button

범용 버튼 컴포넌트.

**Import:**
```tsx
import { Button } from '@/components/ui'
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary'` \| `'secondary'` \| `'ghost'` \| `'destructive'` \| `'outline'` \| `'link'` | `'primary'` | 버튼 스타일 |
| `size` | `'sm'` \| `'default'` \| `'lg'` \| `'icon'` | `'default'` | 버튼 크기 |

**Variants:**

| Variant | 용도 | 스타일 |
|---------|------|--------|
| `primary` | 주요 CTA | 어두운 배경, 밝은 텍스트, shadow |
| `secondary` | 보조 액션 | 밝은 배경, 어두운 텍스트, border |
| `ghost` | 텍스트 버튼 | 투명 배경, hover 시 accent |
| `destructive` | 삭제/위험 | 빨간 배경 |
| `outline` | 테두리 버튼 | 투명 배경, border |
| `link` | 링크 스타일 | 밑줄, 색상 변경 |

**Sizes:**

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 28px (h-7) | px-3 | text-xs |
| `default` | 32px (h-8) | px-3.5 | text-sm |
| `lg` | 40px (h-10) | px-6 | text-base |
| `icon` | 32px (h-8 w-8) | - | - |

**States:**
- Default: 기본 스타일
- Hover: opacity 90%, 약간의 배경 변화
- Active: scale(0.98) 축소 효과
- Focus: ring-2 ring-ring/50 ring-offset-2
- Disabled: opacity-50, pointer-events-none

**Transition:**
```css
transition-all duration-150 ease-out
```

---

### 2.2 Badge

카테고리, 상태 표시용 배지.

**Import:**
```tsx
import { Badge } from '@/components/ui'
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | BadgeVariant | `'default'` | 배지 스타일 |

**Variants:**

| Variant | 용도 | 스타일 |
|---------|------|--------|
| `default` | 기본 | primary 배경 |
| `secondary` | 보조 | secondary 배경 |
| `muted` | 비활성 | muted 배경 |
| `outline` | 테두리만 | border, 투명 배경 |
| `destructive` | 경고 | destructive 배경 |
| `ai` | AI 카테고리 | 보라색 (purple) |
| `startups` | Startups 카테고리 | 초록색 (emerald) |
| `dev` | Dev 카테고리 | 파란색 (blue) |
| `product` | Product 카테고리 | 주황색 (orange) |
| `research` | Research 카테고리 | 청록색 (cyan) |

**Dimensions:**
- Height: auto (content 기반)
- Padding: px-2.5 py-0.5
- Font: text-xs font-medium
- Border Radius: rounded-md

**Transition:**
```css
transition-colors duration-150
```

---

### 2.3 Card

컨텐츠 컨테이너.

**Import:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'
```

**Card Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hover` | `boolean` | `false` | 호버 효과 활성화 |

**Sub-components:**

| Component | Padding | 용도 |
|-----------|---------|------|
| `CardHeader` | p-6 pb-4 | 제목 영역 |
| `CardTitle` | - | 카드 제목 (text-lg font-semibold) |
| `CardDescription` | - | 카드 설명 (text-sm text-muted-foreground) |
| `CardContent` | p-6 pt-0 | 본문 영역 |
| `CardFooter` | p-6 pt-0 | 하단 액션 영역 |

**States:**
- Default: border-border, shadow-sm
- Hover (`hover=true`): shadow-md, border-border/80, cursor-pointer

**Transition:**
```css
transition-all duration-200
```

---

### 2.4 Input

텍스트 입력 필드.

**Import:**
```tsx
import { Input } from '@/components/ui'
```

**Dimensions:**
- Height: 36px (h-9)
- Padding: px-3 py-1.5
- Font: text-sm
- Border Radius: rounded-md

**States:**
- Default: border-input, bg-background
- Hover: border-ring/50
- Focus: ring-2 ring-ring/50, border-ring
- Disabled: opacity-50, cursor-not-allowed

**Transition:**
```css
transition-all duration-150
```

---

### 2.5 Skeleton

로딩 플레이스홀더.

**Import:**
```tsx
import { Skeleton } from '@/components/ui'
```

**Styling:**
- Background: bg-muted
- Animation: animate-pulse
- Border Radius: rounded-md

**사용 예시:**
```tsx
// 텍스트 로딩
<Skeleton className="h-4 w-[200px]" />

// 이미지 로딩
<Skeleton className="h-[112px] w-[112px] rounded-lg" />

// 카드 로딩
<Skeleton className="h-[120px] w-full" />
```

---

### 2.6 ThemeToggle

다크모드 토글 버튼.

**Import:**
```tsx
import { ThemeToggle } from '@/components/ui'
```

**동작:**
- Light mode: Sun 아이콘 표시
- Dark mode: Moon 아이콘 표시
- 클릭 시 토글

**아이콘 Transition:**
```css
transition-all duration-200
rotate-0 scale-100 → -rotate-90 scale-0 (Sun)
rotate-90 scale-0 → rotate-0 scale-100 (Moon)
```

**의존성:**
- `next-themes` 라이브러리
- `lucide-react` 아이콘

---

### 2.7 Sidebar

사이드바 네비게이션 컴포넌트.

**구조:**
```
Sidebar
├── SidebarSection
│   ├── SidebarSectionTitle
│   └── SidebarItem (repeatable)
├── SidebarSection
│   ├── SidebarSectionTitle
│   ├── SidebarCollapsible
│   │   └── SidebarItem (repeatable)
│   └── SidebarItem
└── SidebarFooter (optional)
```

**SidebarItem States:**
- Default: 투명 배경
- Hover: bg-sidebar-accent
- Active: bg-sidebar-accent, font-medium, indicator dot (●)

**Pin Icon Interaction:**
- Default: 숨김
- Hover: 표시 (📌 또는 커스텀 아이콘)
- Click: Unpin 동작

**Width:**
- Desktop: 200-240px (디자이너 결정)
- Collapsed: 0px 또는 아이콘만

---

### 2.8 FilterBar

카테고리 필터 칩 바.

**구조:**
```
FilterBar
└── FilterChip (repeatable)
    └── [All] [AI] [Startups] [Dev] [Product] [Research]
```

**FilterChip States:**
- Default: bg-secondary, text-secondary-foreground
- Selected: bg-primary, text-primary-foreground
- Hover: opacity 변화

**Layout:**
- Desktop: 가로 나열
- Mobile: 가로 스크롤 (scrollbar-hide)

**Visibility:**
- Live Feed (`/timeline`): 표시
- Category Filter (`/timeline?category=`): 표시
- Search (`/timeline?q=`): 표시 (비활성)
- **Company Feed (`/timeline?company=`): 숨김** (회사가 이미 카테고리 특수성을 가짐)

**Dimensions:**
- Height: 32px
- Padding: px-3
- Gap: 8px
- Border Radius: rounded-full 또는 rounded-md

---

### 2.9 NewsCard

뉴스 아이템 카드.

**정보 계층 (Priority Order):**
1. **Title** - 무슨 일이 있었는지 (text-base font-semibold, max 2 lines)
2. **Summary** - 왜 중요한지 (text-sm, max 2 lines, line-clamp-2)
3. **Metadata** - 시간 + 카테고리 배지 (text-xs text-muted-foreground)
4. **Source** - 출처 + 외부 링크 (text-xs)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Title (L1)                          [Thumbnail] │
│ Summary... (L2)                                 │
│ 3h ago  [AI Badge]  (L3)                        │
│ TechCrunch ↗  (L4)                              │
└─────────────────────────────────────────────────┘
```

**Thumbnail:**
- Size: 112x112px
- Border Radius: rounded-lg
- Optional (이미지 없으면 숨김)

**Time Display Rules:**
| 조건 | 포맷 |
|------|------|
| < 1분 | "Just now" |
| < 60분 | "Xm ago" |
| < 24시간 | "Xh ago" |
| < 7일 | "Xd ago" |
| >= 7일 | "M/D HH:mm" |

**Interaction:**
- 전체 카드 클릭 가능
- 클릭 시 sourceUrl로 새 탭 열기

---

### 2.10 DateSeparator

날짜 구분선.

**Format:**
```
Tuesday, February 4, 2026
```

**Styling:**
- Font: text-sm font-medium
- Color: text-muted-foreground
- 위아래 여백: py-4

---

### 2.11 DateDropdown

날짜 선택 드롭다운. FilterBar 오른쪽에 배치.

**Import:**
```tsx
import { DateDropdown } from '@/components/news'
```

**기능:**
- 스크롤 연동: 현재 보고 있는 날짜 자동 표시
- 날짜 점프: 선택 시 해당 날짜로 스크롤

**옵션:**
- Today, Yesterday, 최근 7일 날짜 목록

> 상세 스펙: `.taskmaster/docs/timeline-ux.md` 참조

---

### 2.12 Toast & Toaster

알림 메시지 컴포넌트.

**Import:**
```tsx
import { Toast, Toaster } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
```

**사용:**
```tsx
const { toast } = useToast()
toast({ title: "Pinned!", description: "OpenAI added to your feed" })
```

**Variants:**
- default: 일반 알림
- destructive: 에러/경고

---

### 2.13 BottomSheet

모바일 바텀 시트 컴포넌트.

**Import:**
```tsx
import { BottomSheet } from '@/components/ui'
```

**용도:**
- 모바일에서 Sidebar 대체
- 메뉴, 필터 등 표시

---

### 2.14 CommandPalette

전역 검색 팔레트. ⌘K로 열기.

**Import:**
```tsx
import { CommandPalette } from '@/components'
```

**기능:**
- 뉴스 검색
- 검색 히스토리
- 키보드 네비게이션

---

### 2.15 CompanyLogo

회사 로고 컴포넌트.

**Import:**
```tsx
import { CompanyLogo } from '@/components'
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `company` | `string` | 회사 slug (e.g., "openai") |
| `size` | `number` | 로고 크기 (기본 24) |

**Fallback:** 로고 없을 시 회사명 첫 글자 표시

---

### 2.16 CompanyFeedHeader

회사 피드 페이지 상단 헤더.

**Import:**
```tsx
import { CompanyFeedHeader } from '@/components/news'
```

**구성:**
- 회사 로고 + 이름
- Pin/Unpin 버튼
- 날짜 드롭다운

---

### 2.17 EmptyState

빈 상태 표시 컴포넌트.

**Import:**
```tsx
import { EmptyState } from '@/components/news'
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `type` | `'search'` \| `'category'` \| `'company'` \| `'error'` | 빈 상태 유형 |
| `query` | `string` | 검색어 (search 타입) |
| `category` | `string` | 카테고리 (category 타입) |
| `company` | `string` | 회사명 (company 타입) |

---

## 3. Patterns

### 3.1 Transitions

모든 인터랙션에 일관된 트랜지션을 적용합니다.

| 유형 | Duration | Easing | 용도 |
|------|----------|--------|------|
| Micro | 150ms | ease-out | 버튼, 입력 필드 |
| Standard | 200ms | ease-out | 카드, 토글 |
| Emphasis | 300ms | ease-in-out | 모달, 사이드바 |

**CSS:**
```css
/* Micro */
transition-all duration-150 ease-out

/* Standard */
transition-all duration-200

/* Emphasis */
transition-all duration-300 ease-in-out
```

---

### 3.2 Keyboard Shortcuts

| 단축키 | 동작 | 컨텍스트 |
|--------|------|----------|
| `⌘K` / `Ctrl+K` | 검색 포커스 | 전역 |
| `Escape` | 검색 닫기 / 모달 닫기 | 검색, 모달 |
| `↑` `↓` | 검색 결과 탐색 | 검색 (향후) |
| `Enter` | 선택 확인 | 검색 (향후) |

---

### 3.3 Responsive Breakpoints

| Breakpoint | Width | Sidebar | Search | Filter |
|------------|-------|---------|--------|--------|
| Mobile | < 768px | Bottom Sheet | 아이콘 → 오버레이 | 가로 스크롤 |
| Tablet (md) | >= 768px | 접을 수 있음 | 인라인 | 가로 나열 |
| Desktop (lg) | >= 1024px | 고정 표시 | 인라인 | 가로 나열 |

**Tailwind Breakpoints:**
```css
/* Mobile first */
base: < 768px
md: >= 768px
lg: >= 1024px
xl: >= 1280px
2xl: >= 1536px
```

---

### 3.4 Empty States

각 상황에 맞는 빈 상태 메시지를 제공합니다.

| 상황 | 제목 | 설명 |
|------|------|------|
| 검색 결과 없음 | "No results found" | "Try different keywords or check spelling" |
| 카테고리 결과 없음 | "No {category} news yet" | "Check back later for updates" |
| 회사 뉴스 없음 | "No news about {company}" | "We'll show updates when they appear" |
| 핀한 회사 없음 | "No pinned companies" | "Pin companies for quick access" |
| 네트워크 에러 | "Unable to load" | "Check your connection and try again" |

**Empty State 구조:**
```
┌─────────────────────────────────────┐
│         [Illustration]             │
│                                     │
│         Title (text-lg)            │
│   Description (text-muted)         │
│                                     │
│         [Optional CTA]             │
└─────────────────────────────────────┘
```

---

### 3.5 Loading States

| 컴포넌트 | 로딩 표현 |
|----------|-----------|
| NewsCard | Skeleton (제목 + 요약 + 메타) |
| FilterBar | Skeleton chips |
| Sidebar | Skeleton items |
| 전체 페이지 | Skeleton 조합 |
| 무한 스크롤 | 하단 Spinner 또는 Skeleton cards |

---

### 3.6 Focus Management

접근성을 위한 포커스 관리 패턴.

**Focus Ring:**
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring/50
focus-visible:ring-offset-2
```

**Focus Trap:**
- 모달, 드롭다운 열림 시 내부로 포커스 제한
- Escape로 닫기
- 닫힘 시 트리거 요소로 포커스 복원

---

## 4. Utility Classes

### 4.1 Custom Utilities

`index.css`에 정의된 커스텀 유틸리티:

| Class | 용도 |
|-------|------|
| `.scrollbar-hide` | 스크롤바 숨김 (모바일 필터 등) |
| `.text-gradient` | 텍스트 그라데이션 |
| `.section-divider` | 섹션 구분선 (border-t border-border) |

### 4.2 cn() 유틸리티

클래스 병합 유틸리티.

**Import:**
```tsx
import { cn } from '@/lib/utils'
```

**사용:**
```tsx
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className
)} />
```

---

## Document Metadata

- **Version**: 1.1
- **Created**: 2026-02-04
- **Updated**: 2026-02-04
- **Status**: Active
- **Related Docs**:
  - IA: `.taskmaster/docs/IA.txt`
  - PRD: `.taskmaster/docs/prd.txt`
  - Timeline UX: `.taskmaster/docs/timeline-ux.md`
  - Screen Inventory: `.taskmaster/docs/screen-inventory.md`
  - Migration: `.taskmaster/docs/migration-v2.md`
