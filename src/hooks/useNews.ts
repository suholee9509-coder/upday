import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchNews, supabase } from '@/lib/db'
import { getMockNews } from '@/lib/mock-data'
import { isRelevantForCompany } from '@/lib/company-relevance'
import type { NewsItem, NewsQueryParams, Category } from '@/types/news'

// Simple in-memory cache for stale-while-revalidate pattern
const cache = new Map<string, { items: Omit<NewsItem, 'body'>[]; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute

function getCacheKey(category?: Category | null, q?: string, company?: string | null): string {
  return `${category || 'all'}-${q || ''}-${company || ''}`
}

interface UseNewsOptions {
  category?: Category | null
  q?: string
  company?: string | null
  initialLimit?: number
}

interface UseNewsResult {
  items: Omit<NewsItem, 'body'>[]
  hasMore: boolean
  loading: boolean
  error: string | null
  loadMore: () => void
  refresh: () => void
  jumpToDate: (date: Date) => Promise<boolean>
}

/**
 * Hook for fetching news with pagination
 * Falls back to mock data if Supabase is not configured
 */
export function useNews(options: UseNewsOptions = {}): UseNewsResult {
  const { category, q, company, initialLimit = 20 } = options
  const [items, setItems] = useState<Omit<NewsItem, 'body'>[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cursorRef = useRef<string | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingRef = useRef(false)

  const fetchData = useCallback(async (reset: boolean = false) => {
    // Prevent duplicate requests
    if (isLoadingRef.current && !reset) return
    isLoadingRef.current = true

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const cacheKey = getCacheKey(category, q, company)

    // Check cache for instant display (stale-while-revalidate)
    if (reset) {
      cursorRef.current = undefined
      const cached = cache.get(cacheKey)
      if (cached) {
        setItems(cached.items)
        setHasMore(true) // Assume more until proven otherwise
        setLoading(false)
        // If cache is fresh, don't refetch
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          isLoadingRef.current = false
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
        company: company || undefined,
        cursor: reset ? undefined : cursorRef.current,
      }

      let result: { items: Omit<NewsItem, 'body'>[]; hasMore: boolean }

      // Use Supabase if configured, otherwise fall back to mock data
      if (supabase) {
        result = await fetchNews(params)
      } else {
        // Use mock data
        result = getMockNews(params)
      }

      // Apply relevance filter for company queries
      // DB returns all articles mentioning the company, but we only show highly relevant ones
      let filteredItems = result.items
      if (company) {
        filteredItems = result.items.filter(item => isRelevantForCompany(item, company))
      }

      if (reset) {
        setItems(filteredItems)
        // Update cache
        cache.set(cacheKey, { items: filteredItems, timestamp: Date.now() })
      } else {
        setItems((prev) => [...prev, ...filteredItems])
      }

      // hasMore is based on original result (there might be more after filtering)
      setHasMore(result.hasMore)

      // Update cursor for next page (use original items to not skip any)
      if (result.items.length > 0) {
        cursorRef.current = result.items[result.items.length - 1].publishedAt
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Failed to fetch news')
      }
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [category, q, company, initialLimit])

  // Initial fetch and refetch on filter/search change
  useEffect(() => {
    cursorRef.current = undefined
    fetchData(true)
  }, [category, q, company]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (!isLoadingRef.current && hasMore) {
      fetchData(false)
    }
  }, [hasMore, fetchData])

  const refresh = useCallback(() => {
    cursorRef.current = undefined
    fetchData(true)
  }, [fetchData])

  // Jump to a specific date by fetching from that date directly
  const jumpToDate = useCallback(async (targetDate: Date): Promise<boolean> => {
    // Create cursor for the day after target (to include target date)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    nextDay.setHours(0, 0, 0, 0)
    const jumpCursor = nextDay.toISOString()

    try {
      const params: NewsQueryParams = {
        limit: initialLimit,
        category: category || undefined,
        q: q || undefined,
        company: company || undefined,
        cursor: jumpCursor,
      }

      let result: { items: Omit<NewsItem, 'body'>[]; hasMore: boolean }

      if (supabase) {
        result = await fetchNews(params)
      } else {
        result = getMockNews(params)
      }

      // Apply relevance filter for company queries
      let filteredItems = result.items
      if (company) {
        filteredItems = result.items.filter(item => isRelevantForCompany(item, company))
      }

      if (filteredItems.length === 0) {
        return false
      }

      // Merge with existing items (dedupe by id, sort by date)
      setItems((prev) => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = filteredItems.filter(item => !existingIds.has(item.id))
        const merged = [...prev, ...newItems]
        // Sort by date descending
        merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        return merged
      })

      // Update cursor to continue pagination from the new position
      if (result.items.length > 0) {
        cursorRef.current = result.items[result.items.length - 1].publishedAt
      }
      setHasMore(result.hasMore)

      return true
    } catch {
      return false
    }
  }, [category, q, company, initialLimit])

  return {
    items,
    hasMore,
    loading: loading && items.length === 0,
    error,
    loadMore,
    refresh,
    jumpToDate,
  }
}
