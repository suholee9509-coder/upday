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

  // Error state
  if (error) {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
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

      {/* Load more button */}
      {hasMore && !loading && onLoadMore && (
        <div className="p-6 text-center">
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
