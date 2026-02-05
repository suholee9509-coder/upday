import { useState, memo } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentLanguage } from '@/lib/i18n'
import type { NewsItem, Category } from '@/types/news'

// Category tag styles matching Badge component
const categoryStyles: Record<Category, string> = {
  ai: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  startups: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  dev: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  product: 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  research: 'border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
}

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
  userKeywords?: string[]
}

export const NewsCard = memo(function NewsCard({ item, className, userKeywords = [] }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = item.imageUrl && !imageError

  // Use Korean content when available and in Korean mode
  const currentLang = getCurrentLanguage()
  const displayTitle = currentLang === 'ko' && item.titleKo ? item.titleKo : item.title
  const displaySummary = currentLang === 'ko' && item.summaryKo ? item.summaryKo : item.summary

  // Find matching user keywords in title or summary
  const matchingKeywords = userKeywords.filter(keyword => {
    const lowerKeyword = keyword.toLowerCase()
    const inTitle = displayTitle.toLowerCase().includes(lowerKeyword)
    const inSummary = displaySummary.toLowerCase().includes(lowerKeyword)
    return inTitle || inSummary
  }).slice(0, 3) // Limit to 3 keywords per card

  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block group px-6 py-4 border-b border-border',
        'hover:bg-muted/50 active:bg-muted/70',
        'cursor-pointer contain-layout contain-paint',
        className
      )}
    >
      <article>
        <div className={cn('flex gap-4', showImage && 'items-start')}>
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* 1st: Title - highest visual weight */}
            <h2 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-foreground/90">
              {displayTitle}
            </h2>

            {/* 2nd: Summary - why it matters */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
              {displaySummary}
            </p>

            {/* 3rd: Time + Tags - metadata */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <TimeDisplay publishedAt={item.publishedAt} />
              {/* Category Tag (colored) */}
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide",
                categoryStyles[item.category]
              )}>
                {item.category}
              </span>
              {/* User Keywords (highlighted) */}
              {matchingKeywords.map(keyword => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border border-primary/15 bg-primary/5 text-primary/70"
                >
                  {keyword}
                </span>
              ))}
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
