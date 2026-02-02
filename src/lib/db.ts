import { createClient } from '@supabase/supabase-js'
import type { NewsItem, NewsQueryParams, NewsResponse, Category } from '@/types/news'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Using mock data.')
}

// Create Supabase client (only if credentials exist)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database row type (snake_case from DB)
interface NewsItemRow {
  id: string
  title: string
  summary: string
  body: string
  category: Category
  source: string
  source_url: string
  image_url: string | null
  published_at: string
  created_at: string
}

// Transform DB row to NewsItem
function transformRow(row: NewsItemRow): Omit<NewsItem, 'body'> {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    category: row.category,
    source: row.source,
    sourceUrl: row.source_url,
    imageUrl: row.image_url || undefined,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }
}

/**
 * Fetch news items from Supabase
 */
export async function fetchNews(params: NewsQueryParams = {}): Promise<NewsResponse> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { limit = 20, cursor, category, q } = params

  let query = supabase
    .from('news_items')
    .select('id, title, summary, category, source, source_url, image_url, published_at, created_at')
    .order('published_at', { ascending: false })
    .limit(limit + 1) // Fetch one extra to check hasMore

  // Filter by category
  if (category) {
    query = query.eq('category', category)
  }

  // Search by keyword (title + summary)
  if (q) {
    query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
  }

  // Cursor-based pagination
  if (cursor) {
    query = query.lt('published_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch news: ${error.message}`)
  }

  const rows = data as NewsItemRow[]
  const hasMore = rows.length > limit
  const items = rows.slice(0, limit).map(transformRow)

  return { items, hasMore }
}

/**
 * Fetch a single news item by ID (including body)
 */
export async function fetchNewsById(id: string): Promise<NewsItem | null> {
  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch news item: ${error.message}`)
  }

  const row = data as NewsItemRow
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    body: row.body,
    category: row.category,
    source: row.source,
    sourceUrl: row.source_url,
    imageUrl: row.image_url || undefined,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }
}
