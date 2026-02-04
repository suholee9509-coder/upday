# PRD: 기사 크롤링 주기 개선 및 자동화

## 개요

upday 서비스의 기사 크롤링 주기를 12시간에서 4시간으로 단축하고, AI 처리 비용을 최적화하여 UX를 향상시키는 프로젝트입니다. UI/시각적 변경 없이 백엔드 로직만 개선합니다.

## 현재 상태 (2024-02-03 완료)

- **크롤링 주기**: ~~GitHub Actions로 하루 2회~~ → Cloudflare Workers Cron 4시간 간격 ✅
- **Cloudflare Workers**: ~~비활성화 상태~~ → 활성화 및 배포 완료 ✅
- **AI 처리**: URL 중복 제거 + AI 캐시 테이블 구축 ✅
- **RSS 소스**: ~~13개 피드~~ → 30개 피드 (US/EU/Global 다양화) ✅

### 완료된 작업

| 항목 | 파일 | 상태 |
|------|------|------|
| Cron 4시간 설정 | `wrangler-ingest.toml` | ✅ |
| Workers 에러 핸들링 | `workers/ingest.ts` | ✅ |
| Exponential backoff | `workers/ingest.ts` | ✅ |
| RSS 소스 다양화 (30개) | `src/lib/rss-feeds.ts`, `workers/ingest.ts` | ✅ |
| AI 캐시 테이블 | `supabase/migrations/`, `src/lib/ai-cache.ts` | ✅ |
| 배치 처리 최적화 (5 concurrent) | `src/lib/ai.ts` | ✅ |
| 처리 통계 로깅 | `workers/ingest.ts` | ✅ |
| 모니터링 스크립트 | `scripts/monitor.ts` | ✅ |

### 미완료 (P2 선택사항)

- 실패 알림 시스템 (Discord/Slack webhook)
- 비용 알림 (일일 한도 설정)
- ~~상세 모니터링 대시보드~~ → `scripts/monitor.ts` 구현 완료 ✅

## 목표

1. **크롤링 주기 단축**: 12시간 → 4시간 (하루 6회)
2. **AI 비용 최적화**: 스마트 처리로 불필요한 API 호출 제거
3. **자동화 강화**: Cloudflare Workers Cron 활성화
4. **안정성 향상**: 실패 시 재시도 및 모니터링 추가

## 상세 요구사항

### 1. Cloudflare Workers Cron 활성화

#### 1.1 wrangler.toml 설정 업데이트
- 현재 주석 처리된 cron triggers를 4시간 간격으로 설정
- 스케줄: `0 */4 * * *` (매 4시간마다)

#### 1.2 workers/ingest.ts 최적화
- 에러 핸들링 강화
- 실행 로그 추가
- 타임아웃 설정 검토

### 2. AI 스마트 처리 시스템

#### 2.1 중복 기사 AI 처리 스킵
- deduplication 단계에서 이미 존재하는 기사는 AI 처리 완전 스킵
- 새로운 기사만 AI 요약/분류 수행

#### 2.2 AI 응답 캐싱
- 동일 도메인/유사 컨텐츠에 대한 분류 결과 캐싱
- 캐시 키: 컨텐츠 해시 또는 URL 기반
- 캐시 TTL: 24시간

#### 2.3 배치 처리 최적화
- AI API 호출 배치 크기 조정
- Rate limiting 개선 (현재 3개 동시 처리)

### 3. 비용 모니터링 시스템

#### 3.1 처리 통계 로깅
- 크롤링당 처리된 기사 수
- AI API 호출 횟수
- 캐시 히트율
- 실행 시간

#### 3.2 비용 알림 (선택사항)
- 일일 AI API 호출 한도 설정
- 한도 초과 시 알림

### 4. GitHub Actions 업데이트

#### 4.1 백업 스케줄 유지
- Cloudflare Workers 실패 시 대비용
- 하루 2회에서 1회로 축소 (비용 절감)
- 또는 완전 비활성화 후 수동 트리거만 유지

### 5. 에러 핸들링 강화

#### 5.1 재시도 로직
- RSS 피드 실패 시 exponential backoff 재시도
- 개별 피드 실패가 전체 크롤링에 영향 없도록 격리

#### 5.2 실패 알림
- 연속 실패 시 알림 (Discord/Slack webhook 또는 이메일)

## 기술 스택

- **Runtime**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude 3 Haiku / OpenAI GPT-4o-mini
- **Scheduling**: Cloudflare Cron Triggers (주), GitHub Actions (보조)

## 성공 지표

1. 크롤링 주기: 4시간 이내 달성
2. AI API 비용: 기존 대비 30% 이상 절감
3. 크롤링 성공률: 99% 이상
4. 평균 처리 시간: 2분 이내

### 6. RSS 소스 다양화 (신규 추가)

#### 6.1 문제점
- TechCrunch 등 특정 플랫폼 편중으로 콘텐츠 다양성 부족
- Workers와 src/lib/crawl.ts 간 소스 불일치
- 글로벌 서비스로서 지역/관점 다양성 필요

#### 6.2 추가할 글로벌 RSS 소스

**일반/글로벌 테크:**
- Wired: `https://www.wired.com/feed/rss`
- MIT Technology Review: `https://www.technologyreview.com/feed/`
- BBC Technology: `https://feeds.bbci.co.uk/news/technology/rss.xml`
- Engadget: `https://www.engadget.com/rss.xml`
- The Register (UK): `https://www.theregister.com/headlines.atom`
- ZDNet: `https://www.zdnet.com/news/rss.xml`
- Rest of World (글로벌 테크): `https://restofworld.org/feed/latest/`

**AI 특화:**
- MIT Tech Review AI: `https://www.technologyreview.com/topic/artificial-intelligence/feed`

**스타트업:**
- Crunchbase News: `https://news.crunchbase.com/feed/`

**우주/과학:**
- Space.com: `http://www.space.com/feeds.xml`
- Phys.org: `https://phys.org/rss-feed/`

**개발:**
- The New Stack: `https://thenewstack.io/feed/`
- InfoQ: `https://feed.infoq.com/`

**디자인:**
- Designboom: `https://www.designboom.com/feed/`
- Core77: `https://feeds.feedburner.com/core77/blog`

#### 6.3 구현 전략
- 공유 설정 파일 `src/lib/rss-feeds.ts` 생성
- Workers와 src/lib/crawl.ts 양쪽에서 동일 소스 사용
- 카테고리별 소스 균형 유지 (특정 플랫폼 30% 이하)
- 피드당 최대 10개 아이템 제한

#### 6.4 소스 관리 원칙
- 신뢰성 있는 글로벌 미디어 우선
- 지역 다양성 (미국, 유럽, 아시아 등)
- 정기적인 피드 유효성 점검 (월 1회)
- 차단된 피드는 graceful degradation 처리

## 범위 외 (Out of Scope)

- UI/UX 변경
- 실시간 크롤링 (WebSocket/SSE)
- 사용자별 맞춤 크롤링

## 우선순위

1. **P0 (필수)**: Cloudflare Workers Cron 활성화, 기본 스마트 처리
2. **P1 (중요)**: AI 캐싱, 비용 로깅
3. **P2 (선택)**: 알림 시스템, 상세 모니터링 대시보드
