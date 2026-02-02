import { SearchX, Filter, AlertCircle, Inbox, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type EmptyStateType = 'search' | 'filter' | 'error' | 'empty' | 'loading'

interface EmptyStateProps {
  type: EmptyStateType
  query?: string
  category?: string
  onReset?: () => void
  onRetry?: () => void
  className?: string
}

export function EmptyState({
  type,
  query,
  category,
  onReset,
  onRetry,
  className,
}: EmptyStateProps) {
  const states = {
    search: {
      icon: <SearchX className="h-12 w-12 text-muted-foreground/50" />,
      title: 'No results found',
      description: query
        ? `No news matching "${query}". Try a different search term.`
        : 'Enter a search term to find news.',
      action: onReset && (
        <Button variant="outline" onClick={onReset}>
          Clear search
        </Button>
      ),
    },
    filter: {
      icon: <Filter className="h-12 w-12 text-muted-foreground/50" />,
      title: 'No news in this category',
      description: category
        ? `No ${category.toUpperCase()} news available yet. Check back later or try another category.`
        : 'Select a category to filter news.',
      action: onReset && (
        <Button variant="outline" onClick={onReset}>
          Show all news
        </Button>
      ),
    },
    error: {
      icon: <AlertCircle className="h-12 w-12 text-destructive/50" />,
      title: 'Something went wrong',
      description: "We couldn't load the news. Please try again.",
      action: (
        <Button variant="outline" onClick={onRetry || (() => window.location.reload())}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      ),
    },
    empty: {
      icon: <Inbox className="h-12 w-12 text-muted-foreground/50" />,
      title: 'No news yet',
      description: 'News will appear here once our sources are updated.',
      action: null,
    },
    loading: {
      icon: (
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      ),
      title: 'Loading...',
      description: 'Fetching the latest news for you.',
      action: null,
    },
  }

  const state = states[type]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-4">{state.icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{state.title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {state.description}
      </p>
      {state.action && <div>{state.action}</div>}
    </div>
  )
}
