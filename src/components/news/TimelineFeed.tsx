import { useEffect, useRef, useCallback } from 'react'
import { NewsCard } from './NewsCard'
import { DateSeparator } from './DateSeparator'
import { NewsCardSkeleton } from './NewsCardSkeleton'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui'
import { isSameDay, cn } from '@/lib/utils'
import type { NewsItem, Category } from '@/types/news'

type EmptyStateType = 'search' | 'filter' | 'error' | 'empty'

interface TimelineFeedProps {
  items: Omit<NewsItem, 'body'>[]
  hasMore: boolean
  loading?: boolean
  error?: string | null
  onLoadMore?: () => void
  onReset?: () => void
  onRetry?: () => void
  emptyStateType?: EmptyStateType
  searchQuery?: string
  category?: Category | null
  className?: string
}

export function TimelineFeed({
  items,
  hasMore,
  loading = false,
  error = null,
  onLoadMore,
  onReset,
  onRetry,
  emptyStateType,
  searchQuery,
  category,
  className,
}: TimelineFeedProps) {
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

  // Group items by date
  const groupedItems: { date: string; items: typeof items }[] = []
  items.forEach((item) => {
    const lastGroup = groupedItems[groupedItems.length - 1]
    if (!lastGroup || !isSameDay(lastGroup.date, item.publishedAt)) {
      groupedItems.push({ date: item.publishedAt, items: [item] })
    } else {
      lastGroup.items.push(item)
    }
  })

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
    const type = emptyStateType || (searchQuery ? 'search' : category ? 'filter' : 'empty')

    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        {liveRegion}
        <EmptyState
          type={type}
          query={searchQuery}
          category={category || undefined}
          onReset={onReset}
        />
      </div>
    )
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {liveRegion}
      {groupedItems.map((group) => (
        <div key={group.date}>
          <DateSeparator date={group.date} />
          {group.items.map((item) => (
            <NewsCard key={item.id} item={item} />
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
}
