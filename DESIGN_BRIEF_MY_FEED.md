# 🎨 My Feed UI/UX Design Brief

> **AI 디자이너에게**: 이 문서는 upday 뉴스 플랫폼의 My Feed 페이지 UI/UX 디자인을 위한 완전한 가이드입니다. 모든 기능 로직은 구현 완료되었으며, 오직 시각적 디자인과 사용자 경험 개선만 필요합니다.

---

## 📌 프로젝트 컨텍스트

### upday 플랫폼 개요
- **프로덕트**: 타임라인 기반 글로벌 뉴스 플랫폼
- **타겟 유저**: 정보 민감형 전문가 (PM, 개발자, 투자자, 창업가)
- **핵심 가치**: AI 요약 + 시간순 정렬로 "지금 무엇이 변하고 있는가" 파악
- **디자인 철학**: 미니멀, 스캔 가능, 정보 밀도 높음, 시간축 중심

### 기존 디자인 시스템
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Color Scheme**:
  - Background: `bg-background`
  - Foreground: `text-foreground`
  - Muted: `text-muted-foreground`
  - Primary: `bg-primary`, `text-primary-foreground`
  - Accent: `bg-accent`, `text-accent-foreground`
  - Border: `border-border`
- **Typography**: 시스템 폰트 스택
- **Spacing**: Tailwind 기본 scale (4px 단위)
- **참고 컴포넌트**:
  - `src/components/news/NewsCard.tsx` (기존 뉴스 카드)
  - `src/components/layout/Sidebar.tsx` (사이드바 네비게이션)
  - `src/components/layout/Header.tsx` (헤더)

---

## 🎯 작업 범위

### ✅ 이미 구현된 것 (건드리지 마세요)
- ✅ 모든 비즈니스 로직 (importance scoring, clustering, filtering)
- ✅ 데이터 fetching 및 상태 관리 (hooks)
- ✅ 라우팅 및 인증 플로우
- ✅ Props 인터페이스 및 TypeScript 타입
- ✅ 기본 기능 (클릭, 확장/축소, 주 선택)

### 🎨 디자인이 필요한 것
1. **WeeklyBar** - 주간 타임라인 바 (가로 스크롤 네비게이션)
2. **ClusterCard** - 뉴스 클러스터 카드 (대표 기사 + 관련 기사)
3. **MyFeedPage** - 전체 페이지 레이아웃 및 상태 화면

---

## 📐 컴포넌트별 디자인 요구사항

---

## 1️⃣ WeeklyBar (주간 타임라인 바)

### 📍 위치 및 역할
- **파일**: `src/components/timeline/WeeklyBar.tsx`
- **위치**: 페이지 최상단, 헤더 아래 고정 (sticky)
- **역할**: 최근 12주 중 특정 주를 선택하여 해당 주의 중요 뉴스 표시

### 🔌 Props 인터페이스 (변경 금지)
```typescript
interface Week {
  weekStart: string    // ISO date (Monday)
  weekEnd: string      // ISO date (Sunday)
  label: string        // "1/20-26" or "1/20-2/2"
  totalItems: number   // 해당 주의 뉴스 개수
}

interface WeeklyBarProps {
  weeks: Week[]                    // 12개 week 배열
  selectedWeekIndex: number        // 현재 선택된 주 (0 = 최신)
  onSelectWeek: (index: number) => void  // 주 선택 핸들러
  className?: string
}
```

### 🎨 디자인 요구사항

#### 레이아웃
```
┌─────────────────────────────────────────────────────────────┐
│  ◀  [1/13-19] [1/20-26] [1/27-2/2] [2/3-9●current] ...  ▶  │
│                                      ▲ selected              │
└─────────────────────────────────────────────────────────────┘
```

#### 필수 요소
1. **이전/다음 화살표 버튼** (양 끝)
   - 비활성화 상태 시각화 (맨 처음/마지막 도달 시)
   - hover/active 상태

2. **주 버튼** (가로 스크롤 가능)
   - **기본 상태**: 중립적인 카드 스타일
   - **선택 상태**: 강조 (예: primary color 배경)
   - **현재 주 표시**: "current" 라벨 또는 특수 표시
   - 뉴스 개수 표시 (예: "15 items")
   - 각 버튼 최소 너비: 80-100px
   - 모바일: 터치 친화적 크기 (최소 44x44px)

3. **스크롤 인디케이터** (선택 사항)
   - 양 끝에 fade gradient 효과
   - 또는 스크롤 가능 여부 힌트

#### 상호작용
- ✅ **클릭**: 주 선택 (이미 구현됨)
- 🎨 **드래그/스와이프**: 모바일에서 가로 스크롤
- 🎨 **키보드 네비게이션**: 좌/우 화살표 키로 이동
- 🎨 **애니메이션**: 주 선택 시 부드러운 전환
- 🎨 **스크롤**: 선택한 주가 항상 보이도록 자동 스크롤

#### 반응형
- **Desktop**: 한 줄에 6-8주 표시
- **Tablet**: 한 줄에 4-5주 표시
- **Mobile**: 한 줄에 3-4주 표시, 스와이프 강조

#### 디자인 체크리스트
- [ ] 선택된 주가 명확히 구분됨
- [ ] 현재 주 표시가 직관적
- [ ] 스크롤 가능 여부가 명확
- [ ] 화살표 비활성화 상태가 명확
- [ ] 터치 타겟 크기 충분 (모바일)
- [ ] 애니메이션이 자연스러움
- [ ] 다크 모드 대응
- [ ] 접근성 (ARIA labels, focus indicator)

---

## 2️⃣ ClusterCard (뉴스 클러스터 카드)

### 📍 역할
- 같은 이벤트의 기사들을 그룹화하여 표시
- 대표 기사 1개 + 관련 기사 N개
- 확장/축소 가능

### 🔌 데이터 구조 (변경 금지)
```typescript
interface NewsCluster {
  id: string
  representative: NewsItem      // 대표 기사
  related: NewsItem[]          // 관련 기사 배열
  clusterSize: number          // 전체 기사 수 (1 + related.length)
}

// NewsItem은 기존 NewsCard와 동일한 구조
```

### 🎨 디자인 요구사항

#### 레이아웃 (축소 상태)
```
┌─────────────────────────────────────────────────┐
│ [대표 기사 - NewsCard 컴포넌트 재사용]            │
│                                                  │
│ 📰 OpenAI releases GPT-5 with...                │
│ OpenAI announced the release of GPT-5, a...     │
│ TechCrunch · 2h ago                             │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ ▼ Show 3 related articles                │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

#### 레이아웃 (확장 상태)
```
┌─────────────────────────────────────────────────┐
│ [대표 기사]                                      │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ ▲ Hide 3 related articles                │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ┌────────── Related ──────────┐                 │
│ │ [관련 기사 1]                 │                 │
│ │ [관련 기사 2]                 │                 │
│ │ [관련 기사 3]                 │                 │
│ └─────────────────────────────┘                 │
└─────────────────────────────────────────────────┘
```

#### 필수 디자인 요소
1. **클러스터 표시**
   - 시각적 인디케이터 (배지, 아이콘, 색상 등)
   - "3 related articles" 텍스트
   - 클러스터 크기가 클수록 중요도 높음 암시

2. **확장/축소 버튼**
   - 아이콘 + 텍스트
   - 상태 명확 (▼/▲)
   - 전체 너비 또는 인라인
   - hover 상태

3. **관련 기사 섹션** (확장 시)
   - 대표 기사와 시각적으로 구분
   - 왼쪽 border 또는 indent
   - 배경색 차이 (subtle)
   - 각 관련 기사는 NewsCard 재사용

#### 상호작용
- ✅ **클릭**: 확장/축소 토글 (이미 구현됨)
- 🎨 **애니메이션**: 부드러운 expand/collapse
- 🎨 **hover**: 버튼 강조
- 🎨 **포커스**: 키보드 네비게이션 대응

#### 디자인 체크리스트
- [ ] 클러스터 여부가 즉시 인지됨
- [ ] 확장/축소 버튼이 직관적
- [ ] 관련 기사가 대표 기사와 명확히 구분됨
- [ ] 애니메이션이 자연스러움 (150-300ms)
- [ ] 단일 기사 (clusterSize=1)도 위화감 없음
- [ ] 모바일에서도 읽기 편함
- [ ] 다크 모드 대응

---

## 3️⃣ MyFeedPage (페이지 전체 레이아웃)

### 📍 구조
```
┌─────────────────────────────────────────────┐
│ Header (재사용)                              │
├─────────────────────────────────────────────┤
│ [Sidebar] │ [WeeklyBar - sticky]           │
│           ├─────────────────────────────────┤
│           │ [ClusterCard 1]                 │
│           │ [ClusterCard 2]                 │
│           │ [ClusterCard 3]                 │
│           │ ...                             │
│           │                                 │
└─────────────────────────────────────────────┘
```

### 🎨 디자인 요구사항

#### 메인 콘텐츠 영역
- **최대 너비**: 3xl (768px) - 가독성 최적화
- **여백**: 좌우 padding 4 (16px)
- **배경**: `bg-background`
- **구분선**: 각 ClusterCard 사이 border

#### 상태별 화면

##### 1. Loading State
```
┌─────────────────────────────────────────────┐
│           [Spinner]                          │
│        Loading your feed...                  │
└─────────────────────────────────────────────┘
```
- 중앙 정렬
- 스피너 + 텍스트
- 최소 높이: 100vh

##### 2. No Interests State (onboarding 미완료)
```
┌─────────────────────────────────────────────┐
│           [AlertCircle Icon]                 │
│        Set up your interests                 │
│   To see your personalized feed, please...  │
│        [Go to Settings Button]               │
└─────────────────────────────────────────────┘
```
- 중앙 정렬
- 아이콘 (크기: 48px)
- 제목 (text-xl)
- 설명 (text-sm, muted)
- CTA 버튼 (primary)

##### 3. Empty State (해당 주에 뉴스 없음)
```
┌─────────────────────────────────────────────┐
│  [WeeklyBar with selected week]             │
├─────────────────────────────────────────────┤
│                                              │
│        No important news this week           │
│   We haven't found any significant news...   │
│                                              │
└─────────────────────────────────────────────┘
```
- 중앙 정렬
- 부드러운 톤의 메시지
- 다른 주 선택 유도

##### 4. Error State
```
┌─────────────────────────────────────────────┐
│           [AlertCircle Icon - red]           │
│        Failed to load your feed              │
│        [Error message]                       │
│        [Try Again Button]                    │
└─────────────────────────────────────────────┘
```
- `text-destructive` 사용
- 명확한 재시도 CTA

##### 5. Success State (뉴스 있음)
```
┌─────────────────────────────────────────────┐
│  [WeeklyBar with week selection]            │
├─────────────────────────────────────────────┤
│  [ClusterCard 1]                             │
│  [ClusterCard 2]                             │
│  [ClusterCard 3]                             │
│  ...                                         │
└─────────────────────────────────────────────┘
```

#### 반응형 레이아웃
- **Desktop (≥768px)**: Sidebar 고정 (240px) + 메인 콘텐츠
- **Mobile (<768px)**: Sidebar 숨김 (햄버거 메뉴), 풀 너비

#### 디자인 체크리스트
- [ ] WeeklyBar가 스크롤 시 상단 고정
- [ ] 로딩 스켈레톤 추가 (선택 사항)
- [ ] Empty state가 친근함
- [ ] Error state가 명확하고 액션 가능
- [ ] 뉴스가 많을 때 스크롤 성능 최적화
- [ ] 모바일에서 터치 제스처 편함
- [ ] 다크 모드 완벽 대응
- [ ] 접근성 (heading hierarchy, landmarks)

---

## 🎯 디자인 우선순위

### P0 (필수)
1. ✅ WeeklyBar 기본 스타일 및 선택 상태
2. ✅ ClusterCard 확장/축소 UI
3. ✅ 모든 상태 화면 (loading, empty, error)

### P1 (중요)
4. 🎨 WeeklyBar 스크롤 애니메이션
5. 🎨 ClusterCard expand/collapse 애니메이션
6. 🎨 반응형 최적화 (mobile)

### P2 (개선)
7. 🎨 드래그/스와이프 제스처
8. 🎨 키보드 네비게이션
9. 🎨 로딩 스켈레톤
10. 🎨 마이크로 인터랙션 (hover, focus)

---

## 📦 작업 파일 목록

### 수정 필요 파일
1. **src/components/timeline/WeeklyBar.tsx** (147 lines)
   - 현재: 기본 버튼 스타일
   - 필요: 전체 UI/UX 개선

2. **src/pages/MyFeedPage.tsx** (245 lines)
   - 현재: 기본 레이아웃
   - 필요: ClusterCard 디자인, 상태 화면 개선

### 참고 파일 (건드리지 마세요)
- `src/hooks/useMyFeed.ts` - 데이터 로직
- `src/lib/importance.ts` - 중요도 계산
- `src/lib/clustering.ts` - 클러스터링 로직

### 재사용 컴포넌트
- `src/components/news/NewsCard.tsx` - 개별 뉴스 카드 (수정 금지)
- `src/components/ui/*` - shadcn/ui 컴포넌트들
- `lucide-react` - 아이콘 라이브러리

---

## 🚀 기대하는 결과물

### 제출 형식
1. **수정된 컴포넌트 파일**
   - `WeeklyBar.tsx`
   - `MyFeedPage.tsx` (ClusterCard 부분)

2. **새로운 컴포넌트** (필요 시)
   - 예: `ClusterBadge.tsx`, `WeekButton.tsx` 등
   - 단, 기존 Props 인터페이스는 유지

3. **CSS/스타일** (필요 시)
   - Tailwind classes 사용
   - 커스텀 CSS는 최소화 (필요 시 `@apply` 사용)

### 품질 기준
- ✅ TypeScript 에러 없음 (`npm run build` 성공)
- ✅ 기존 기능 동작 유지
- ✅ Props 인터페이스 변경 없음
- ✅ 반응형 (mobile/tablet/desktop)
- ✅ 다크 모드 대응
- ✅ 접근성 (WCAG 2.1 AA)

---

## 💡 디자인 가이드라인

### DO ✅
- 기존 디자인 시스템 색상/폰트 사용
- Tailwind utility classes 활용
- 기존 NewsCard 스타일 참고
- 미니멀하고 정보 중심적 디자인
- 스캔 가능성 (정보 계층 명확)
- 부드러운 애니메이션 (150-300ms)
- 모바일 우선 고려

### DON'T ❌
- Props 인터페이스 변경
- 비즈니스 로직 수정
- 과도한 애니메이션 (산만함)
- 불필요한 이미지/일러스트
- 복잡한 커스텀 CSS
- 접근성 무시

---

## 🔗 참고 자료

### 디자인 영감
- **타임라인 네비게이션**: Apple Music (연도별 네비게이션), Spotify (플레이리스트 스크롤)
- **뉴스 클러스터링**: Google News (관련 기사 그룹화), Apple News (story clusters)
- **미니멀 뉴스 UI**: Hacker News, Reddit, Twitter

### 기술 문서
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Accessibility](https://react.dev/learn/accessibility)

---

## ❓ 질문이 있다면

### 확인 가능한 것
1. 기존 컴포넌트 스타일: `src/components/news/NewsCard.tsx` 참고
2. 색상 시스템: Tailwind 기본 + shadcn/ui theme
3. 아이콘: lucide-react 라이브러리

### 자유롭게 결정 가능한 것
- 애니메이션 스타일 (단, 150-300ms 권장)
- 클러스터 표시 방법 (배지, 아이콘, 색상 등)
- 마이크로 인터랙션 디테일
- 레이아웃 여백/간격 (가독성 우선)

### 절대 변경 불가
- Props 인터페이스
- Hook 로직
- 라우팅 구조
- 데이터 흐름

---

**준비 완료!** 🎨

위 요구사항을 바탕으로 WeeklyBar와 MyFeedPage의 UI를 개선해주세요. 기능은 모두 작동하므로, 시각적 디자인과 사용자 경험에만 집중하면 됩니다.
