import { useState, memo } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { NewsItem } from '@/types/news'

// Format relative time (e.g., "5m ago", "2h ago", "Yesterday")
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// NOW indicator for articles published within the last hour
function TimeDisplay({ publishedAt }: { publishedAt: string | Date }) {
  const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt
  const isNow = Date.now() - date.getTime() < 60 * 60 * 1000 // 1 hour
  const timeAgo = formatTimeAgo(date)

  return (
    <time className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {isNow && (
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-label="Recently published" />
      )}
      {timeAgo}
    </time>
  )
}

interface NewsCardProps {
  item: Omit<NewsItem, 'body'>
  className?: string
}

export const NewsCard = memo(function NewsCard({ item, className }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = item.imageUrl && !imageError

  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block group p-4 border-b border-border',
        'transition-colors duration-150 hover:bg-muted/50',
        'cursor-pointer',
        className
      )}
    >
      <article>
        <div className={cn('flex gap-4', showImage && 'items-start')}>
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* 1st: Title - highest visual weight */}
            <h2 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-foreground/90">
              {item.title}
            </h2>

            {/* 2nd: Summary - why it matters */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
              {item.summary}
            </p>

            {/* 3rd: Time + Category - metadata */}
            <div className="flex items-center gap-2 mb-2">
              <TimeDisplay publishedAt={item.publishedAt} />
              <Badge variant={item.category} className="text-[10px] uppercase tracking-wide">
                {item.category}
              </Badge>
            </div>

            {/* 4th: Source indicator */}
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{item.source}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </div>

          {/* Thumbnail */}
          {showImage && (
            <div className="flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={`${item.title} - ${item.source}`}
                width={112}
                height={112}
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg bg-muted"
              />
            </div>
          )}
        </div>
      </article>
    </a>
  )
})
