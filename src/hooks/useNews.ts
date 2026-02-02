import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchNews, supabase } from '@/lib/db'
import { getMockNews } from '@/lib/mock-data'
import type { NewsItem, NewsQueryParams, Category } from '@/types/news'

// Simple in-memory cache for stale-while-revalidate pattern
const cache = new Map<string, { items: Omit<NewsItem, 'body'>[]; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute

function getCacheKey(category?: Category | null, q?: string): string {
  return `${category || 'all'}-${q || ''}`
}

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
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (reset: boolean = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const cacheKey = getCacheKey(category, q)

    // Check cache for instant display (stale-while-revalidate)
    if (reset) {
      const cached = cache.get(cacheKey)
      if (cached) {
        setItems(cached.items)
        setLoading(false)
        // If cache is fresh, don't refetch
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          return
        }
      }
    }

    if (!cache.has(cacheKey)) {
      setLoading(true)
    }
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
        // Update cache
        cache.set(cacheKey, { items: result.items, timestamp: Date.now() })
      } else {
        setItems((prev) => [...prev, ...result.items])
      }

      setHasMore(result.hasMore)

      // Update cursor for next page
      if (result.items.length > 0) {
        setCursor(result.items[result.items.length - 1].publishedAt)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch news')
      }
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
