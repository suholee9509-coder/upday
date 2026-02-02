import { useState, useCallback, useEffect } from 'react'
import { fetchNews, supabase } from '@/lib/db'
import { getMockNews } from '@/lib/mock-data'
import type { NewsItem, NewsQueryParams, Category } from '@/types/news'

interface UseNewsOptions {
  category?: Category | null
  q?: string
  initialLimit?: number
}

interface UseNewsResult {
  items: Omit<NewsItem, 'body'>[]
  hasMore: boolean
  loading: boolean
  error: string | null
  loadMore: () => void
  refresh: () => void
}

/**
 * Hook for fetching news with pagination
 * Falls back to mock data if Supabase is not configured
 */
export function useNews(options: UseNewsOptions = {}): UseNewsResult {
  const { category, q, initialLimit = 20 } = options
  const [items, setItems] = useState<Omit<NewsItem, 'body'>[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const fetchData = useCallback(async (reset: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const params: NewsQueryParams = {
        limit: initialLimit,
        category: category || undefined,
        q: q || undefined,
        cursor: reset ? undefined : cursor,
      }

      let result: { items: Omit<NewsItem, 'body'>[]; hasMore: boolean }

      // Use Supabase if configured, otherwise fall back to mock data
      if (supabase) {
        result = await fetchNews(params)
      } else {
        // Use mock data
        result = getMockNews(params)
      }

      if (reset) {
        setItems(result.items)
      } else {
        setItems((prev) => [...prev, ...result.items])
      }

      setHasMore(result.hasMore)

      // Update cursor for next page
      if (result.items.length > 0) {
        setCursor(result.items[result.items.length - 1].publishedAt)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
    } finally {
      setLoading(false)
    }
  }, [category, q, cursor, initialLimit])

  // Initial fetch and refetch on filter/search change
  useEffect(() => {
    setCursor(undefined)
    fetchData(true)
  }, [category, q]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(false)
    }
  }, [loading, hasMore, fetchData])

  const refresh = useCallback(() => {
    setCursor(undefined)
    fetchData(true)
  }, [fetchData])

  return {
    items,
    hasMore,
    loading: loading && items.length === 0,
    error,
    loadMore,
    refresh,
  }
}
