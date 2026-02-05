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
 */
function groupByWeeks(newsItems: NewsItemWithScore[]): WeekData[] {
  const weeks: WeekData[] = []
  const now = new Date()
  const currentWeekStart = getWeekStart(now)

  // Generate 12 weeks (current + 11 past)
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() - i * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekItems = newsItems.filter(item => {
      const itemDate = new Date(item.publishedAt)
      return itemDate >= weekStart && itemDate <= weekEnd
    })

    // Convert to full NewsItem for clustering (add empty body)
    const fullItems: NewsItem[] = weekItems.map(item => ({
      ...item,
      body: '',
    }))

    const clusters = clusterNews(fullItems)

    weeks.push({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      label: getWeekLabel(weekStart),
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

  const fetchMyFeed = useCallback(async () => {
    if (!hasInterests || !interests) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch news from last 12 weeks
      const twelveWeeksAgo = new Date()
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7)

      // Fetch more items to ensure good coverage across all 12 weeks (fetch 800 items)
      const limit = 800

      let allItems: Omit<NewsItem, 'body'>[] = []

      // Fetch in batches if needed
      let cursor: string | undefined = undefined
      let hasMore = true
      let fetchedCount = 0

      // Filter by user's selected categories at DB level for efficiency
      const userCategories = interests.categories as Category[]

      while (hasMore && fetchedCount < limit) {
        const result: { items: Omit<NewsItem, 'body'>[]; hasMore: boolean } = supabase
          ? await fetchNews({ limit: 50, cursor, categories: userCategories })
          : getMockNews({ limit: 50, cursor })

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

      // Step 3: Filter by importance threshold (40+)
      // Skip threshold if user has no keywords/companies (category-only mode)
      // Threshold 40 allows: category(15) + company(25) = 40 to pass
      const hasSpecificInterests = (interests.keywords?.length || 0) > 0 || (interests.companies?.length || 0) > 0
      const importantItems = hasSpecificInterests
        ? filterByImportance(scoredItems, 40)
        : scoredItems // Category-only: show all matched items

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
    fetchMyFeed()
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
