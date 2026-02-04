# upday v2 Migration Guide

## Overview

이 문서는 upday v1에서 v2로 마이그레이션하는 방법을 설명합니다.

**주요 변경사항:**
- 카테고리 시스템: 6개 → 5개
- Company Feed 기능 추가
- 사이드바 기반 레이아웃

---

## 1. Category Migration

### 변경 매핑

| v1 Category | v2 Category | 액션 |
|-------------|-------------|------|
| `ai` | `ai` | 유지 |
| `startup` | `startups` | 이름 변경 (복수형) |
| `science` | `research` | 통합 |
| `design` | `product` | 확장 |
| `space` | `research` | 통합 |
| `dev` | `dev` | 유지 |

### Database Migration SQL

```sql
-- Step 1: Add companies column
ALTER TABLE news_items ADD COLUMN IF NOT EXISTS companies TEXT[] DEFAULT '{}';

-- Step 2: Migrate categories
UPDATE news_items SET category = 'startups' WHERE category = 'startup';
UPDATE news_items SET category = 'product' WHERE category = 'design';
UPDATE news_items SET category = 'research' WHERE category IN ('science', 'space');

-- Step 3: Update category constraint
ALTER TABLE news_items DROP CONSTRAINT IF EXISTS news_items_category_check;
ALTER TABLE news_items ADD CONSTRAINT news_items_category_check
  CHECK (category IN ('ai', 'startups', 'dev', 'product', 'research'));

-- Step 4: Create companies index
CREATE INDEX IF NOT EXISTS idx_news_companies ON news_items USING GIN(companies);

-- Step 5: Verify migration
SELECT category, COUNT(*) FROM news_items GROUP BY category ORDER BY category;
```

### Rollback SQL (if needed)

```sql
-- Rollback categories
UPDATE news_items SET category = 'startup' WHERE category = 'startups';
UPDATE news_items SET category = 'design' WHERE category = 'product';
-- Note: 'research' cannot be split back to 'science' and 'space' without additional logic

-- Rollback constraint
ALTER TABLE news_items DROP CONSTRAINT IF EXISTS news_items_category_check;
ALTER TABLE news_items ADD CONSTRAINT news_items_category_check
  CHECK (category IN ('ai', 'startup', 'science', 'design', 'space', 'dev'));
```

---

## 2. Code Changes Checklist

### Already Updated ✅
- [x] `types/news.ts` - Category type, Company interface
- [x] `lib/constants.ts` - CATEGORIES, COMPANIES arrays
- [x] `scripts/schema.sql` - New schema with companies column
- [x] `lib/ai.ts` - Classification prompt
- [x] `.taskmaster/docs/prd.txt` - PRD with new categories & Company Feed
- [x] `docs/IA.txt` - IA v2.0

### Needs Implementation (Post-Design)
- [ ] `components/news/FilterBar.tsx` - Update category chips
- [ ] `components/news/NewsCard.tsx` - Badge color mapping
- [ ] `pages/TimelinePage.tsx` - Sidebar layout
- [ ] `components/layout/Sidebar.tsx` - New component
- [ ] `pages/CompanyBrowserPage.tsx` - New page
- [ ] `hooks/usePinnedCompanies.ts` - LocalStorage hook
- [ ] `lib/db.ts` - Company filter query support

---

## 3. Migration Steps

### Phase 1: Database (Before Deployment)
1. Backup current database
2. Run migration SQL in Supabase
3. Verify category counts

### Phase 2: Code Deployment
1. Deploy updated code
2. Verify FilterBar shows 5 categories
3. Verify AI classification uses new categories

### Phase 3: Company Feed (After Design)
1. Implement sidebar component
2. Implement company browser page
3. Implement pin functionality
4. Test company filtering

---

## 4. Testing Checklist

### Category Migration
- [ ] All existing articles have valid v2 categories
- [ ] FilterBar shows: All, AI, Startups, Dev, Product, Research
- [ ] New articles are classified into v2 categories
- [ ] URL params work: `?category=startups`, `?category=product`, `?category=research`

### Company Feed (Post-Implementation)
- [ ] Company browser shows 25 companies in 4 groups
- [ ] Pin/unpin works via LocalStorage
- [ ] Pinned companies appear in sidebar
- [ ] `?company=openai` filters correctly
- [ ] Mobile bottom sheet shows companies

---

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Category migration fails | High | Backup DB, test in staging first |
| Old category in URL | Low | Redirect or show "category not found" |
| Cached AI responses with old categories | Low | Cache expires, new articles get new categories |
| LocalStorage conflicts | Low | Use unique key prefix (`upday_`) |

---

## Document Info

- **Created**: 2026-02-04
- **Status**: Ready for execution
- **Prerequisites**: Design approval for sidebar/company feed UI
