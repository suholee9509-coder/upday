export type Category = 'ai' | 'startups' | 'dev' | 'product' | 'research'

export type CompanyGroup = 'ai-llm' | 'developer-tools' | 'productivity-saas' | 'commerce-platform'

export interface Company {
  id: string              // slug (e.g., "openai")
  name: string            // display name (e.g., "OpenAI")
  logoUrl?: string        // company logo
  group: CompanyGroup     // for browser categorization
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  titleKo?: string        // Korean translation of title
  summaryKo?: string      // Korean translation of summary
  body: string
  category: Category
  companies?: string[]    // associated company slugs (e.g., ["openai", "microsoft"])
  source: string
  sourceUrl: string
  imageUrl?: string       // og:image or RSS enclosure
  publishedAt: string     // ISO 8601, UTC
  createdAt: string
}

export interface NewsQueryParams {
  limit?: number    // default 20
  cursor?: string   // publishedAt of last item
  category?: Category
  categories?: Category[]  // multiple categories (OR filter)
  company?: string  // company slug filter
  q?: string        // search query
}

export interface NewsResponse {
  items: Omit<NewsItem, 'body'>[] // body not sent to client
  hasMore: boolean
}
