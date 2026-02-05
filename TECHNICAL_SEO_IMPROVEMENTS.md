# Technical SEO Improvements Plan

오늘 작성됨: 2026-02-05

## 🎯 목표
현재 SEO 점수 79 → 90+ 달성 및 실제 트래픽 증가

---

## ✅ 완료된 작업

### 1. 개별 뉴스 페이지 추가 (`/news/{id}`)
- **파일:** `src/pages/NewsDetailPage.tsx`
- **라우트:** `/news/:id`
- **효과:**
  - 개별 뉴스가 검색 결과에 색인 가능
  - NewsArticle structured data 자동 주입
  - Breadcrumb navigation 추가
  - 롱테일 키워드 타겟 가능

### 2. 회사별 페이지 추가 (`/company/{id}`)
- **파일:** `src/pages/CompanyPage.tsx`
- **라우트:** `/company/:companyId` (25개 회사)
- **효과:**
  - "OpenAI news", "Anthropic updates" 같은 롱테일 키워드 타겟
  - 25개 회사 × 평균 100 검색/월 = 2,500 방문자/월 잠재력
  - CollectionPage structured data 추가

---

## 🔴 Critical 문제 - 즉시 해결 필요

### 3. React SPA 문제 - Prerendering 추가

**문제:**
```html
<!-- 크롤러가 보는 초기 HTML -->
<body>
  <div id="root"></div>  <!-- 비어있음 -->
</body>
```

**해결 옵션:**

#### Option A: Cloudflare Pages Prerendering (추천 ⭐)
Cloudflare Pages는 자동 prerendering을 지원하지만 직접 설정 필요.

**설정 방법:**
1. Cloudflare Dashboard > Workers & Pages > upday 선택
2. Settings > Functions > Headers/Redirects 탭
3. `_headers` 파일에 추가:
```
/
  X-Robots-Tag: all

/*
  X-Robots-Tag: all
```

4. **Cloudflare의 Crawler Hints 활용:**
   - [Cloudflare Crawler Hints](https://blog.cloudflare.com/cloudflare-crawler-hints-support/)
   - `<meta name="cf-2fa-verify" content="none" />` 추가하면 크롤러에게 정적 HTML 제공

#### Option B: react-snap (로컬 prerendering)
```bash
npm install --save-dev react-snap
```

**package.json:**
```json
{
  "scripts": {
    "postbuild": "react-snap"
  },
  "reactSnap": {
    "include": [
      "/",
      "/timeline",
      "/ai",
      "/startups",
      "/dev",
      "/product",
      "/research"
    ],
    "inlineCss": true,
    "minifyHtml": {
      "collapseWhitespace": true,
      "removeComments": true
    }
  }
}
```

**리스크:**
- 빌드 시간 증가
- 동적 콘텐츠는 여전히 JS 필요

#### Option C: Next.js 마이그레이션 (장기)
**장점:**
- SSR/SSG 기본 지원
- Automatic Static Optimization
- Image Optimization
- ISR (Incremental Static Regeneration)

**단점:**
- 완전한 리팩토링 필요 (2-3주)
- React Router → Next.js Router 마이그레이션

**권장:** Option A (Crawler Hints) → Option B (react-snap) → Option C (Next.js, 장기)

---

### 4. 동적 Sitemap.xml 생성

**문제:** 현재 sitemap.xml이 정적이라 새 뉴스가 추가되어도 업데이트 안 됨

**해결:** Cloudflare Worker로 동적 sitemap 생성

**파일:** `workers/sitemap.ts`
```typescript
import { supabase } from './supabase' // Supabase client

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/sitemap.xml') {
      return generateSitemap()
    }

    if (url.pathname === '/news-sitemap.xml') {
      return generateNewsSitemap()
    }

    return new Response('Not Found', { status: 404 })
  },
}

async function generateSitemap(): Promise<Response> {
  const now = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages = [
    { loc: 'https://updayapp.com', lastmod: now, priority: '1.0' },
    { loc: 'https://updayapp.com/timeline', lastmod: now, priority: '0.9' },
    { loc: 'https://updayapp.com/ai', lastmod: now, priority: '0.8' },
    { loc: 'https://updayapp.com/startups', lastmod: now, priority: '0.8' },
    { loc: 'https://updayapp.com/dev', lastmod: now, priority: '0.8' },
    { loc: 'https://updayapp.com/product', lastmod: now, priority: '0.8' },
    { loc: 'https://updayapp.com/research', lastmod: now, priority: '0.8' },
  ]

  // Company pages (25 companies)
  const companies = ['openai', 'anthropic', 'google', 'microsoft', 'meta', 'nvidia', 'xai', 'mistral', 'vercel', 'supabase', 'cloudflare', 'linear', 'figma', 'notion', 'cursor', 'github', 'databricks', 'apple', 'amazon', 'tesla', 'stripe', 'shopify', 'slack', 'discord', 'reddit']
  const companyPages = companies.map(id => ({
    loc: `https://updayapp.com/company/${id}`,
    lastmod: now,
    priority: '0.7',
  }))

  // Recent news pages (top 1000)
  const { data: recentNews } = await supabase
    .from('news_items')
    .select('id, published_at')
    .order('published_at', { ascending: false })
    .limit(1000)

  const newsPages = (recentNews || []).map((news: any) => ({
    loc: `https://updayapp.com/news/${news.id}`,
    lastmod: news.published_at.split('T')[0],
    priority: '0.6',
  }))

  const allPages = [...staticPages, ...companyPages, ...newsPages]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.priority === '1.0' ? 'daily' : page.priority === '0.9' ? 'hourly' : 'weekly'}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}

async function generateNewsSitemap(): Promise<Response> {
  // Last 7 days of news for Google News
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentNews } = await supabase
    .from('news_items')
    .select('id, title, published_at, category, image_url')
    .gte('published_at', sevenDaysAgo.toISOString())
    .order('published_at', { ascending: false })
    .limit(1000)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${(recentNews || []).map((news: any) => `  <url>
    <loc>https://updayapp.com/news/${news.id}</loc>
    <news:news>
      <news:publication>
        <news:name>Upday</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${news.published_at}</news:publication_date>
      <news:title>${escapeXml(news.title)}</news:title>
    </news:news>
    ${news.image_url ? `<image:image>
      <image:loc>${news.image_url}</image:loc>
    </image:image>` : ''}
    <lastmod>${news.published_at}</lastmod>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
```

**wrangler.toml에 추가:**
```toml
[[routes]]
pattern = "updayapp.com/sitemap.xml"
custom_domain = true

[[routes]]
pattern = "updayapp.com/news-sitemap.xml"
custom_domain = true
```

**배포:**
```bash
npx wrangler deploy -c wrangler-sitemap.toml
```

---

### 5. 개별 뉴스 og:image 동적 생성

**문제:** 모든 뉴스가 같은 og:image 사용 → SNS 공유 시 차별화 없음

**해결:** Cloudflare Workers + Canvas API로 동적 OG 이미지 생성

**참고:** [Vercel OG Image](https://vercel.com/docs/functions/edge-functions/og-image-generation)

**간단한 대안:** 크롤링 시 원본 기사의 og:image를 `image_url`에 저장하고 사용

**src/pages/NewsDetailPage.tsx** (이미 적용됨)
```tsx
<SEO
  image={news.image_url || undefined}  // 개별 이미지 사용
/>
```

---

## 🟠 High Priority - 1주일 내 완료

### 6. Google Discover 최적화

**index.html 수정 필요:**
```html
<!-- 기존 -->
<meta name="description" content="AI-summarized tech news..." />

<!-- 개선 (더 구체적이고 액션 지향적) -->
<meta name="description" content="Get AI-summarized tech news from OpenAI, Google, Microsoft. Breaking updates on ChatGPT, Claude, Gemini. Updated every 4 hours. No ads, no noise." />
```

**카테고리 페이지 하단에 FAQ 추가:**

**src/pages/CategoryPage.tsx 수정:**
```tsx
{/* FAQ Section for AI Overview */}
<section className="mt-12 prose prose-lg dark:prose-invert max-w-none">
  <h2>Frequently Asked Questions</h2>

  <h3>What is {categoryInfo?.name}?</h3>
  <p>{content.intro}</p>

  <h3>How often is this feed updated?</h3>
  <p>We update our news feed every 4 hours from over 50 trusted sources including TechCrunch, The Verge, Hacker News, and official company blogs.</p>

  <h3>Can I filter news by company?</h3>
  <p>Yes! We track 25 major tech companies. Visit our <Link to="/timeline/companies">Companies page</Link> to see company-specific news.</p>
</section>
```

### 7. 페이지 속도 최적화

**현재:** 283KB (90.5KB gzipped) - 🟡 보통

**개선 방법:**

1. **Code Splitting 개선**
```tsx
// App.tsx - 현재 모든 페이지가 lazy load됨 (✅ 좋음)
const LandingPage = lazy(() => import('@/pages/LandingPage'))
```

2. **Critical CSS Inline**
```bash
npm install --save-dev critters
```

**vite.config.ts:**
```ts
import { critters } from 'vite-plugin-critters'

export default {
  plugins: [
    critters(), // Inline critical CSS
  ],
}
```

3. **Image Optimization**
- 현재 `preload` 사용 중 (✅ 좋음)
- lazy loading 추가:
```tsx
<img src={news.image_url} loading="lazy" />
```

4. **Bundle Analysis**
```bash
npm install --save-dev rollup-plugin-visualizer
```

**vite.config.ts:**
```ts
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({ open: true }),
  ],
}
```

---

## 🟡 Medium Priority - 2주일 내 완료

### 8. 내부 링크 전략

**현재 문제:** 뉴스카드에서 외부 링크만 있고 내부 페이지로 가는 링크 없음

**해결:** NewsCard 컴포넌트 수정

**src/components/news/NewsCard.tsx:**
```tsx
{/* 기존 */}
<a href={news.source_url} target="_blank" rel="noopener noreferrer">
  {news.title}
</a>

{/* 개선 - 내부 페이지로 먼저 */}
<Link to={`/news/${news.id}`}>
  {news.title}
</Link>

{/* Read more는 외부 링크 */}
<a href={news.source_url} target="_blank" rel="noopener noreferrer nofollow">
  Read Original →
</a>
```

**효과:**
- 내부 링크로 PageRank 전달
- 크롤러가 개별 뉴스 페이지 발견
- 체류 시간 증가

### 9. Schema Markup 확장

**현재:** WebSite, NewsMediaOrganization, CollectionPage ✅

**추가 필요:**

1. **Organization Schema** (회사 정보)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Upday",
  "url": "https://updayapp.com",
  "logo": "https://updayapp.com/logo.png",
  "sameAs": [
    "https://bsky.app/profile/updayapp.bsky.social",
    "https://discord.gg/GUkAsmpa",
    "https://t.me/updayapp"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "hello@updayapp.com"
  }
}
```

2. **FAQPage Schema** (카테고리 페이지)
3. **HowTo Schema** (사용 가이드 페이지)

---

## 📊 예상 효과

| 개선 사항 | 트래픽 증가 | 타임라인 |
|----------|-----------|---------|
| 개별 뉴스 페이지 | +500-1K/월 | 2주 후 |
| 회사별 페이지 (25개) | +2-3K/월 | 1개월 후 |
| 동적 Sitemap | +10-20% | 2주 후 |
| Prerendering | +30-50% | 즉시 |
| Google Discover 최적화 | +5-10K/월 | 1-2개월 후 |
| 내부 링크 전략 | +20-30% | 1개월 후 |

**총 예상:** 현재 ~1K/월 → 10-20K/월 (3개월 후)

---

## 🚀 90일 실행 플랜

### Week 1-2 (Foundation)
- [x] 개별 뉴스 페이지 추가
- [x] 회사별 페이지 추가
- [ ] 동적 Sitemap Worker 배포
- [ ] Prerendering 설정 (Cloudflare Crawler Hints)

### Week 3-4 (Optimization)
- [ ] NewsCard 내부 링크 추가
- [ ] Google Discover FAQ 추가
- [ ] 이미지 lazy loading
- [ ] Bundle size 최적화

### Week 5-8 (Content)
- [ ] 회사별 상세 정보 확장 (funding history, timeline)
- [ ] 카테고리별 landing content 추가
- [ ] 내부 링크 구조 강화

### Week 9-12 (Advanced)
- [ ] react-snap prerendering 추가
- [ ] 동적 OG image 생성
- [ ] Product Hunt 런칭
- [ ] Hacker News Show HN

---

## 📚 참고 자료

- [React SEO Guide 2026](https://www.linkgraph.com/blog/seo-for-react-applications/)
- [JavaScript Rendering and SEO](https://www.clickrank.ai/javascript-rendering-affect-seo/)
- [React SEO Best Practices](https://ahrefs.com/blog/react-seo/)
- [Cloudflare Crawler Hints](https://blog.cloudflare.com/cloudflare-crawler-hints-support/)
- [Google Search Central - JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

---

## 🎯 Next Steps

1. **즉시 (오늘):**
   - [x] NewsDetailPage 및 CompanyPage 생성 완료
   - [ ] App.tsx 라우트 추가 확인
   - [ ] 로컬 테스트

2. **내일:**
   - [ ] workers/sitemap.ts 생성 및 배포
   - [ ] Cloudflare Crawler Hints 설정
   - [ ] NewsCard 내부 링크 수정

3. **이번 주:**
   - [ ] Google Discover FAQ 추가
   - [ ] Bundle size 분석 및 최적화
   - [ ] 배포 및 GSC에서 색인 상태 모니터링
