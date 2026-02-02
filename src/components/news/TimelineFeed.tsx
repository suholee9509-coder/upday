import { NewsCard } from './NewsCard'
import { DateSeparator } from './DateSeparator'
import { NewsCardSkeleton } from './NewsCardSkeleton'
import { Button } from '@/components/ui'
import { isSameDay, cn } from '@/lib/utils'
import type { NewsItem } from '@/types/news'

interface TimelineFeedProps {
  items: Omit<NewsItem, 'body'>[]
  hasMore: boolean
  loading?: boolean
  onLoadMore?: () => void
  emptyMessage?: string
  className?: string
}

export function TimelineFeed({
  items,
  hasMore,
  loading = false,
  onLoadMore,
  emptyMessage = 'No news found.',
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

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
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

      {loading && (
        <div>
          {[1, 2, 3].map((i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      )}

      {hasMore && !loading && onLoadMore && (
        <div className="p-6 text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
