/**
 * Hook for My Feed - personalized news with importance scoring and clustering
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { fetchNews, supabase } from '@/lib/db'
import { getMockNews } from '@/lib/mock-data'
import { useUserInterests } from './useUserInterests'
import { useAuth } from './useAuth'
import {
  calculateImportanceScore,
  filterByImportance,
  matchesUserInterests,
  extractCompaniesFromText,
} from '@/lib/importance'
import { clusterNews, type NewsCluster } from '@/lib/clustering'
import type { NewsItem, Category } from '@/types/news'

// Module-level cache for My Feed data (persists across component remounts)
interface FeedCache {
  key: string // JSON of interests
  items: NewsItemWithScore[]
  timestamp: number
}
let feedCache: FeedCache | null = null
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export interface NewsItemWithScore extends Omit<NewsItem, 'body'> {
  score: number
}

export interface WeekData {
  weekStart: string // ISO date string (Monday)
  weekEnd: string // ISO date string (Sunday)
  label: string // "1/20-26"
  clusters: NewsCluster[]
  totalItems: number
}

interface UseMyFeedResult {
  weeks: WeekData[]
  currentWeek: WeekData | null
  selectedWeekIndex: number
  isLoading: boolean
  error: string | null
  selectWeek: (index: number) => void
  refresh: () => void
  hasInterests: boolean
}

/**
 * Get the Monday of the week for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get week label (e.g., "1/20-26")
 */
function getWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const startMonth = weekStart.getMonth() + 1
  const startDay = weekStart.getDate()
  const endMonth = weekEnd.getMonth() + 1
  const endDay = weekEnd.getDate()

  if (startMonth === endMonth) {
    return `${startMonth}/${startDay}-${endDay}`
  } else {
    return `${startMonth}/${startDay}-${endMonth}/${endDay}`
  }
}

/**
 * Group news items by week (last 12 weeks)
 * Optimized: single pass through items instead of 12 filter calls
 */
function groupByWeeks(newsItems: NewsItemWithScore[]): WeekData[] {
  const now = new Date()
  const currentWeekStart = getWeekStart(now)

  // Pre-calculate week boundaries once
  const weekBoundaries: { start: Date; end: Date; startMs: number; endMs: number }[] = []
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    weekBoundaries.push({
      start: weekStart,
      end: weekEnd,
      startMs: weekStart.getTime(),
      endMs: weekEnd.getTime(),
    })
  }

  // Single pass: distribute items into week buckets
  const itemsByWeek: NewsItemWithScore[][] = Array.from({ length: 12 }, () => [])
  for (const item of newsItems) {
    const itemMs = new Date(item.publishedAt).getTime()
    for (let i = 0; i < 12; i++) {
      if (itemMs >= weekBoundaries[i].startMs && itemMs <= weekBoundaries[i].endMs) {
        itemsByWeek[i].push(item)
        break
      }
    }
  }

  // Build week data with clustering
  const weeks: WeekData[] = []
  for (let i = 0; i < 12; i++) {
    const weekItems = itemsByWeek[i]
    const fullItems: NewsItem[] = weekItems.map(item => ({ ...item, body: '' }))
    const clusters = clusterNews(fullItems)

    weeks.push({
      weekStart: weekBoundaries[i].start.toISOString(),
      weekEnd: weekBoundaries[i].end.toISOString(),
      label: getWeekLabel(weekBoundaries[i].start),
      clusters,
      totalItems: weekItems.length,
    })
  }

  return weeks
}

/**
 * Hook for My Feed with importance scoring and clustering
 */
export function useMyFeed(): UseMyFeedResult {
  const { isAuthenticated } = useAuth()
  const { interests, isLoading: interestsLoading, hasCompletedOnboarding } = useUserInterests()

  const [newsItems, setNewsItems] = useState<NewsItemWithScore[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0)

  const hasInterests = isAuthenticated && hasCompletedOnboarding && interests !== null

  const fetchMyFeed = useCallback(async (forceRefresh = false) => {
    if (!hasInterests || !interests) {
      setIsLoading(false)
      return
    }

    // Check cache first (unless force refresh)
    const cacheKey = JSON.stringify({
      categories: interests.categories,
      keywords: interests.keywords,
      companies: interests.companies,
    })

    if (!forceRefresh && feedCache && feedCache.key === cacheKey) {
      const cacheAge = Date.now() - feedCache.timestamp
      if (cacheAge < CACHE_TTL) {
        // Use cached data
        setNewsItems(feedCache.items)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch news from last 12 weeks
      const twelveWeeksAgo = new Date()
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7)

      // Fetch items - use larger batch size to reduce network requests
      // 200 per batch × 13 requests = 2600 max (covers 12 weeks)
      const limit = 2500
      const batchSize = 200

      let allItems: Omit<NewsItem, 'body'>[] = []

      // Fetch in batches
      let cursor: string | undefined = undefined
      let hasMore = true
      let fetchedCount = 0

      // Filter by user's selected categories at DB level for efficiency
      const userCategories = interests.categories as Category[]

      while (hasMore && fetchedCount < limit) {
        const result: { items: Omit<NewsItem, 'body'>[]; hasMore: boolean } = supabase
          ? await fetchNews({ limit: batchSize, cursor, categories: userCategories })
          : getMockNews({ limit: batchSize, cursor })

        allItems = [...allItems, ...result.items]
        fetchedCount += result.items.length
        hasMore = result.hasMore

        if (result.items.length > 0) {
          const lastPublishedAt = result.items[result.items.length - 1].publishedAt
          cursor = lastPublishedAt
          const oldestDate = new Date(lastPublishedAt)
          if (oldestDate < twelveWeeksAgo) {
            break // Stop if we've gone past 12 weeks
          }
        } else {
          break
        }
      }

      // Filter items within 12 weeks
      const recentItems = allItems.filter(item => {
        const itemDate = new Date(item.publishedAt)
        return itemDate >= twelveWeeksAgo
      })

      // Convert to full NewsItem (add empty body for filtering)
      // Pre-extract companies for items without companies field (optimization)
      const userHasCompanies = (interests.companies?.length || 0) > 0
      const fullItems: NewsItem[] = recentItems.map(item => {
        let companies = item.companies || []
        // Pre-extract companies from text if needed (avoids duplicate extraction later)
        if (companies.length === 0 && userHasCompanies) {
          const content = `${item.title} ${item.summary}`.toLowerCase()
          companies = extractCompaniesFromText(content)
        }
        return {
          ...item,
          companies,
          body: '',
        }
      })

      // Step 1: Filter by user interests (basic match)
      const matchedItems = fullItems.filter(item =>
        matchesUserInterests(item, {
          categories: interests.categories as any,
          keywords: interests.keywords || [],
          companies: interests.companies || [],
        })
      )

      // Step 2: Calculate importance score (pre-clustering, clusterSize=1)
      const scoredItems: NewsItemWithScore[] = matchedItems.map(item => {
        const score = calculateImportanceScore(
          item,
          {
            categories: interests.categories as any,
            keywords: interests.keywords || [],
            companies: interests.companies || [],
          },
          1 // Will recalculate after clustering
        )
        return { ...item, score }
      })

      // Step 3: Filter by importance threshold (60+)
      // "Must-see" curation: only high-relevance articles pass
      // Skip threshold if user has no keywords/companies (category-only mode)
      //
      // Threshold 60 requires strong compound signals:
      // - Category(15) + keyword(20) + company(25) = 60 ✓
      // - Category(15) + keyword(20) + company(25) + cross(15) = 75 ✓✓
      // - Category(15) + 2 keywords(40) + event(10) = 65 ✓
      // - Category(15) + company(35) + tier1(10) = 60 ✓
      //
      // Weak matches won't pass:
      // - Category(15) + 2 keywords(40) = 55 ❌
      // - Category(15) + company(25) + tier1(10) = 50 ❌
      const hasSpecificInterests = (interests.keywords?.length || 0) > 0 || (interests.companies?.length || 0) > 0
      const importantItems = hasSpecificInterests
        ? filterByImportance(scoredItems, 60)
        : scoredItems // Category-only: show all matched items

      // Update cache
      feedCache = {
        key: cacheKey,
        items: importantItems,
        timestamp: Date.now(),
      }

      setNewsItems(importantItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch My Feed')
      console.error('Failed to fetch My Feed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [hasInterests, interests])

  // Fetch on mount and when interests change
  useEffect(() => {
    if (!interestsLoading) {
      fetchMyFeed()
    }
  }, [interestsLoading, fetchMyFeed])

  // Group news by weeks
  const weeks = useMemo(() => {
    return groupByWeeks(newsItems)
  }, [newsItems])

  const currentWeek = weeks[selectedWeekIndex] || null

  const selectWeek = useCallback((index: number) => {
    setSelectedWeekIndex(Math.max(0, Math.min(index, 11)))
  }, [])

  const refresh = useCallback(() => {
    fetchMyFeed(true) // Force refresh, bypass cache
  }, [fetchMyFeed])

  return {
    weeks,
    currentWeek,
    selectedWeekIndex,
    isLoading,
    error,
    selectWeek,
    refresh,
    hasInterests,
  }
}
