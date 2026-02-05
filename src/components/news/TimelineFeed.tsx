import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react'
import { NewsCard } from './NewsCard'
import { useLanguage } from '@/hooks/useLanguage'
import { DateSeparator } from './DateSeparator'
import { NewsCardSkeleton } from './NewsCardSkeleton'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui'
import { isSameDay, cn } from '@/lib/utils'
import type { NewsItem, Category } from '@/types/news'

type EmptyStateType = 'search' | 'filter' | 'error' | 'empty' | 'company'

export interface TimelineFeedRef {
  scrollToDate: (date: Date) => void
}

interface TimelineFeedProps {
  items: Omit<NewsItem, 'body'>[]
  hasMore: boolean
  loading?: boolean
  error?: string | null
  onLoadMore?: () => void
  onJumpToDate?: (date: Date) => Promise<boolean>
  onReset?: () => void
  onRetry?: () => void
  emptyStateType?: EmptyStateType
  searchQuery?: string
  category?: Category | null
  companyName?: string
  className?: string
  onVisibleDateChange?: (date: Date) => void
}

export const TimelineFeed = forwardRef<TimelineFeedRef, TimelineFeedProps>(function TimelineFeed({
  items,
  hasMore,
  loading = false,
  error = null,
  onLoadMore,
  onJumpToDate,
  onReset,
  onRetry,
  emptyStateType,
  searchQuery,
  category,
  companyName,
  className,
  onVisibleDateChange,
}, ref) {
  const { currentLanguage: language } = useLanguage()

  // Generate status message for screen readers
  const getStatusMessage = () => {
    if (error) return 'Error loading news. Please try again.'
    if (loading && items.length === 0) return 'Loading news...'
    if (loading) return 'Loading more news...'
    if (items.length === 0) {
      if (searchQuery) return `No results found for "${searchQuery}".`
      if (category) return `No news in ${category} category.`
      return 'No news available.'
    }
    return `${items.length} news items loaded.`
  }

  // Refs for date groups (for scroll-to-date feature)
  const dateGroupRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  // Pending scroll target when date is not yet loaded
  const pendingScrollDate = useRef<Date | null>(null)

  // Try to scroll to a date, returns true if found
  const tryScrollToDate = useCallback((date: Date): boolean => {
    const targetDateStr = date.toDateString()
    for (const [key, element] of dateGroupRefs.current) {
      const groupDate = new Date(key)
      if (groupDate.toDateString() === targetDateStr) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return true
      }
    }
    return false
  }, [])

  // Expose scrollToDate method via ref
  useImperativeHandle(ref, () => ({
    scrollToDate: async (date: Date) => {
      // Try to scroll immediately if already loaded
      if (tryScrollToDate(date)) {
        pendingScrollDate.current = null
        return
      }

      // Use jumpToDate for instant access (skips intermediate loads)
      if (onJumpToDate) {
        pendingScrollDate.current = date
        const success = await onJumpToDate(date)
        if (!success) {
          pendingScrollDate.current = null
        }
        // After jump, items will update and trigger the effect below
        return
      }

      // Fallback: iterative load (slower, for backwards compatibility)
      if (hasMore && onLoadMore && !loading) {
        pendingScrollDate.current = date
        onLoadMore()
      }
    }
  }), [tryScrollToDate, hasMore, onLoadMore, onJumpToDate, loading])

  // When items change, check if we have a pending scroll target
  useEffect(() => {
    if (pendingScrollDate.current && !loading) {
      if (tryScrollToDate(pendingScrollDate.current)) {
        pendingScrollDate.current = null
      } else if (!onJumpToDate && hasMore && onLoadMore) {
        // Only use iterative load if jumpToDate is not available
        onLoadMore()
      } else {
        // No more data or jumpToDate handled it, clear pending
        pendingScrollDate.current = null
      }
    }
  }, [items, loading, hasMore, onLoadMore, onJumpToDate, tryScrollToDate])

  // Track visible date using IntersectionObserver
  useEffect(() => {
    if (!onVisibleDateChange || items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible date separator
        const visibleEntries = entries.filter(e => e.isIntersecting)
        if (visibleEntries.length > 0) {
          // Sort by their position and get the topmost one
          const topEntry = visibleEntries.reduce((top, entry) => {
            const topRect = top.boundingClientRect
            const entryRect = entry.boundingClientRect
            return entryRect.top < topRect.top ? entry : top
          })
          const dateStr = (topEntry.target as HTMLElement).dataset.date
          if (dateStr) {
            onVisibleDateChange(new Date(dateStr))
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '-110px 0px -80% 0px' // Account for header + filterbar, trigger when near top
      }
    )

    // Observe all date group elements
    dateGroupRefs.current.forEach((element) => {
      observer.observe(element)
    })

    return () => observer.disconnect()
  }, [items, onVisibleDateChange])

  // Infinite scroll using IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node
  }, [])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' } // Load 200px before reaching the bottom
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  // Group items by date (memoized to prevent recalculation on every render)
  const groupedItems = useMemo(() => {
    const groups: { date: string; items: typeof items }[] = []
    items.forEach((item) => {
      const lastGroup = groups[groups.length - 1]
      if (!lastGroup || !isSameDay(lastGroup.date, item.publishedAt)) {
        groups.push({ date: item.publishedAt, items: [item] })
      } else {
        lastGroup.items.push(item)
      }
    })
    return groups
  }, [items])

  // Live region for screen reader announcements
  const liveRegion = (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {getStatusMessage()}
    </div>
  )

  // Error state
  if (error) {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        {liveRegion}
        <EmptyState
          type="error"
          onRetry={onRetry}
        />
      </div>
    )
  }

  // Initial loading state
  if (loading && items.length === 0) {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        {liveRegion}
        {[1, 2, 3, 4, 5].map((i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Empty state
  if (!loading && items.length === 0) {
    // Determine empty state type based on context
    const type = emptyStateType || (searchQuery ? 'search' : companyName ? 'company' : category ? 'filter' : 'empty')

    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        {liveRegion}
        <EmptyState
          type={type}
          query={searchQuery}
          category={category || undefined}
          companyName={companyName}
          onReset={onReset}
        />
      </div>
    )
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {liveRegion}
      {groupedItems.map((group) => (
        <div
          key={group.date}
          ref={(el) => {
            if (el) {
              dateGroupRefs.current.set(group.date, el)
            } else {
              dateGroupRefs.current.delete(group.date)
            }
          }}
          data-date={group.date}
        >
          <DateSeparator date={group.date} />
          {group.items.map((item) => (
            <NewsCard key={item.id} item={item} language={language} />
          ))}
        </div>
      ))}

      {/* Loading more indicator */}
      {loading && items.length > 0 && (
        <div>
          {[1, 2, 3].map((i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel + Load more button fallback */}
      {hasMore && !loading && onLoadMore && (
        <div ref={loadMoreRef} className="p-6 text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && items.length > 0 && (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You've reached the end
          </p>
        </div>
      )}
    </div>
  )
})
