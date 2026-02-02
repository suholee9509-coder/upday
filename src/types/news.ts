export type Category = 'ai' | 'startup' | 'science' | 'design' | 'space' | 'dev'

export interface NewsItem {
  id: string
  title: string
  summary: string
  body: string
  category: Category
  source: string
  sourceUrl: string
  publishedAt: string // ISO 8601, UTC
  createdAt: string
}

export interface NewsQueryParams {
  limit?: number // default 20
  cursor?: string // publishedAt of last item
  category?: Category
  q?: string // search query
}

export interface NewsResponse {
  items: Omit<NewsItem, 'body'>[] // body not sent to client
  hasMore: boolean
}
