# Upday AI Prompts 문서

## 개요
이 문서는 Upday 뉴스 플랫폼의 AI 처리 시스템에서 사용하는 프롬프트를 정의합니다.

---

## 1. 요약 생성 (Summary Generation)

### System Prompt
```
You are a concise news summarizer for a tech news platform. Your task is to generate a 2-3 line summary that captures "what happened" and "why it matters."

Rules:
- Be factual and objective - no opinion or interpretation
- Keep the summary between 100-250 characters
- Use present tense for recent events
- Do not start with "This article" or similar phrases
- Focus on the key news event and its significance
- Write in a professional, neutral tone
```

### User Prompt
```
Summarize this news article:

Title: {title}

Content:
{body}

Generate a 2-3 line summary (100-250 characters):
```

### 설정
| 파라미터 | 값 |
|---------|-----|
| Model | gpt-4o-mini / claude-3-haiku |
| Max Tokens | 150 |
| Temperature | 0.3 |
| 입력 본문 제한 | 2,000자 |

---

## 2. 카테고리 분류 (Classification)

### System Prompt
```
You are a news classifier. Classify articles into exactly ONE category based on the primary topic.

Categories:
- ai: Artificial intelligence, machine learning, LLMs, neural networks, chatbots
- startup: Startups, funding rounds, acquisitions, IPOs, entrepreneurship
- science: Scientific research, medical breakthroughs, biology, physics, chemistry
- design: Product design, UX/UI, visual design, creative tools, design systems
- space: Space exploration, aerospace, satellites, astronomy, rockets
- dev: Software development, programming, open source, infrastructure, DevOps

Respond with ONLY the category ID (ai, startup, science, design, space, or dev).
```

### User Prompt
```
Classify this article:

Title: {title}

Content excerpt:
{body}

Category:
```

### 설정
| 파라미터 | 값 |
|---------|-----|
| Model | gpt-4o-mini / claude-3-haiku |
| Max Tokens | 10 |
| Temperature | 0 |
| 입력 본문 제한 | 1,000자 |

---

## 3. Fallback 로직

### 요약 검증
- 50자 미만: 제목으로 대체
- 300자 초과: 297자로 자르고 `...` 추가

### 카테고리 검증
- 유효하지 않은 카테고리: `dev`로 기본값 설정

### 재시도 로직
- 최대 3회 재시도
- Exponential backoff: 1초 → 2초 → 4초

---

## 4. RSS 크롤링 소스

| 소스 | 카테고리 | RSS URL |
|------|---------|---------|
| TechCrunch | ai | https://techcrunch.com/category/artificial-intelligence/feed/ |
| The Verge | ai | https://www.theverge.com/rss/ai-artificial-intelligence/index.xml |
| TechCrunch | startup | https://techcrunch.com/category/startups/feed/ |
| Ars Technica | science | https://feeds.arstechnica.com/arstechnica/science |
| SpaceNews | space | https://spacenews.com/feed/ |
| Dev.to | dev | https://dev.to/feed |

---

## 5. 환경변수

```bash
VITE_AI_PROVIDER=openai          # 또는 anthropic
VITE_OPENAI_API_KEY=sk-xxx       # OpenAI API 키
VITE_ANTHROPIC_API_KEY=sk-ant-xxx # Anthropic API 키
```

---

## 6. 자동 크롤링 스케줄

### GitHub Actions 스케줄
| 시간 (ET) | UTC | Cron 표현식 |
|-----------|-----|-------------|
| 6:00 AM | 11:00 | `0 11 * * *` |
| 6:00 PM | 23:00 | `0 23 * * *` |

### 워크플로우 파일
`.github/workflows/crawl.yml`

### 필요한 GitHub Secrets
| Secret Name | 설명 |
|-------------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 |

### 수동 실행
GitHub → Actions 탭 → "Scheduled RSS Crawl" → "Run workflow"

---

## 7. 비용 추정 (30개 기사 기준)

### gpt-4o-mini
- 1회 크롤링: ~$0.0044 (약 6원)
- 월간 (하루 2회): ~$0.26 (약 350원)

### claude-3-haiku
- 1회 크롤링: ~$0.0077 (약 10원)
- 월간 (하루 2회): ~$0.46 (약 620원)

---

## 8. SEO 최적화

### 메타 태그
| 태그 | 값 |
|------|-----|
| Title | Upday - Tech News, Faster |
| Description | AI-summarized tech news in real-time. Stay ahead with the latest in AI, startups, science, and dev. |
| Robots | index, follow, max-image-preview:large, max-snippet:-1 |

### Open Graph / Twitter Cards
- og:type: website
- og:image: /og-image.png (1200x630)
- twitter:card: summary_large_image

### Structured Data (JSON-LD)
| 스키마 | 용도 |
|--------|------|
| WebSite | 사이트 정보 + SearchAction |
| Organization | 퍼블리셔 정보 |
| BreadcrumbList | 네비게이션 경로 (동적) |
| ItemList | 뉴스 피드 목록 (동적) |
| NewsArticle | 개별 뉴스 기사 (동적) |

### 파일 구조
| 파일 | 용도 | 업데이트 주기 |
|------|------|---------------|
| `/sitemap.xml` | 정적 페이지 사이트맵 | 수동 |
| `/news-sitemap.xml` | 뉴스 기사 사이트맵 | 크롤링 시 자동 |
| `/feed.xml` | RSS 피드 | 크롤링 시 자동 |
| `/robots.txt` | 크롤러 안내 | 수동 |
| `/og-image.png` | 소셜 공유 이미지 | 수동 |

### SEO 컴포넌트 (`src/components/SEO.tsx`)
```typescript
// 기본 SEO
<SEO title="페이지 제목" description="설명" url="/path" />

// 카테고리별 SEO
const seo = CATEGORY_SEO['ai']
<SEO title={seo.title} description={seo.description} />

// 구조화된 데이터 주입
injectBreadcrumbSchema([{ name: 'Home', url: '...' }])
injectItemListSchema([{ title: '...', url: '...', position: 1 }])
injectNewsArticleSchema({ title, summary, publishedAt, source, ... })
```

### 검색엔진 등록 (수동 필요)
1. **Google Search Console**: https://search.google.com/search-console
   - `index.html`의 `GOOGLE_VERIFICATION_CODE` 교체
2. **Naver 서치어드바이저**: https://searchadvisor.naver.com
   - `index.html`의 `NAVER_VERIFICATION_CODE` 교체

### Core Web Vitals 목표
| 지표 | 목표 |
|------|------|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
