# Coding Convention

## 스택

- Next.js 15 (App Router) / TypeScript strict / Tailwind CSS v4 / shadcn/ui / pnpm

## 구조

```
src/
├── app/          # 라우팅 + 페이지만. 비즈니스 로직은 밖으로.
├── components/
│   ├── ui/       # shadcn/ui
│   └── [domain]/ # 도메인별 (news/, landing/, layout/ 등)
├── lib/          # 유틸리티, API, 상수
├── hooks/        # 커스텀 훅
├── types/        # 타입 정의
└── styles/       # globals.css
```

## 네이밍

- 파일: `kebab-case.tsx`
- 컴포넌트: `PascalCase` / 함수·변수: `camelCase` / 상수: `UPPER_SNAKE_CASE`
- Boolean: `is`, `has`, `should` 접두사 권장
- 코드 내 영어 사용 권장. Import는 `@/` 경로 별칭 권장.

## TypeScript

- `any` 지양 → `unknown` + 타입 가드
- `enum` 지양 → `as const` + 유니온 타입
- 객체 형태는 `interface`, 유니온·유틸리티는 `type`
- type-only import 명시: `import { type NewsItem }`

## 컴포넌트

- Server Component 기본. `"use client"` 범위는 최소한으로.
- named export 권장 (페이지 파일은 export default 허용)
- 커스텀 컴포넌트 작성 전 shadcn/ui 존재 여부 먼저 확인

## 스타일링

- 색상은 디자인 시스템 시맨틱 토큰 사용. 하드코딩 색상값 지양.
- 시맨틱 토큰 사용 시 다크모드 자동 전환되므로 `dark:` 남발 불필요.
- 조건부 클래스는 `cn()` 유틸리티 활용.
- 인라인 `style`은 동적 계산값 등 불가피한 경우에만.

## 상태 관리

- URL로 표현 가능한 상태(필터, 검색어)는 `searchParams`로 관리.
- 로컬 UI 상태는 `useState`. 전역 상태는 필요해질 때 Zustand 도입.

## 데이터 페칭

- 초기 데이터는 Server Component에서 fetch.
- 추가 로딩·mutation은 Server Action 우선.
- 모든 fetch에 에러 처리 필수. `error.tsx` 바운더리 활용.

## Git

- Conventional Commits: `feat(scope): description` / 영어, 소문자, 현재형
- 브랜치: `main` → `dev` → `feat/`, `fix/`, `chore/`

## 성능·접근성

- `next/image` 사용 권장. 아이콘 개별 import.
- 시맨틱 HTML (`article`, `main`, `nav`). 아이콘 버튼에 `aria-label`.
- LCP 2초 이내 목표.