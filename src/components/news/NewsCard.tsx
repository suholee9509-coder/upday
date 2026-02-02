import { useState, memo } from 'react'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui'
import { formatRelativeTime, cn } from '@/lib/utils'
import type { NewsItem } from '@/types/news'

interface NewsCardProps {
  item: Omit<NewsItem, 'body'>
  className?: string
}

export const NewsCard = memo(function NewsCard({ item, className }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = item.imageUrl && !imageError

  return (
    <article
      className={cn(
        'group p-4 border-b border-border',
        'transition-colors duration-150 hover:bg-muted/50',
        className
      )}
    >
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
            <time className="text-xs text-muted-foreground">
              {formatRelativeTime(item.publishedAt)}
            </time>
            <Badge variant={item.category} className="text-[10px] uppercase tracking-wide">
              {item.category}
            </Badge>
          </div>

          {/* 4th: Source + Link - action */}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
              'transition-colors duration-150 hover:text-foreground'
            )}
          >
            <span>{item.source}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
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
  )
})
