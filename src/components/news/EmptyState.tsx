import { useNavigate } from 'react-router-dom'
import { SearchX, Filter, AlertCircle, Inbox, RefreshCw, Newspaper, ArrowLeft, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

type EmptyStateType = 'search' | 'filter' | 'error' | 'empty' | 'loading' | 'company'

interface EmptyStateProps {
  type: EmptyStateType
  query?: string
  category?: string
  companyName?: string
  onReset?: () => void
  onRetry?: () => void
  className?: string
}

export function EmptyState({
  type,
  query,
  category,
  companyName,
  onReset,
  onRetry,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Company empty state - 404 style layout
  if (type === 'company') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-20 px-4 text-center',
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="max-w-md">
          {/* Large visual indicator */}
          <div className="mb-6 flex items-center justify-center">
            <div className="relative">
              <Newspaper className="h-20 w-20 text-muted-foreground/20" />
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title with company name */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('empty.noNewsYet')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {companyName
              ? t('empty.noCompanyNews', { company: companyName })
              : t('empty.noCompanyNewsGeneric')}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/timeline')}>
              <Home />
              {t('common.viewAll')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/timeline/companies')}>
              <ArrowLeft />
              {t('common.browseCompanies')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const states = {
    search: {
      icon: <SearchX className="h-12 w-12 text-muted-foreground/50" />,
      title: t('empty.noResults'),
      description: query
        ? t('empty.noResultsFor', { query })
        : t('empty.enterSearchTerm'),
      action: onReset && (
        <Button variant="outline" onClick={onReset}>
          {t('common.clearSearch')}
        </Button>
      ),
    },
    filter: {
      icon: <Filter className="h-12 w-12 text-muted-foreground/50" />,
      title: t('empty.noNewsInCategory'),
      description: category
        ? t('empty.noCategoryNews', { category: category.toUpperCase() })
        : t('empty.selectCategory'),
      action: onReset && (
        <Button variant="outline" onClick={onReset}>
          {t('common.showAllNews')}
        </Button>
      ),
    },
    error: {
      icon: <AlertCircle className="h-12 w-12 text-destructive/50" />,
      title: t('empty.somethingWentWrong'),
      description: t('empty.couldntLoad'),
      action: (
        <Button variant="outline" onClick={onRetry || (() => window.location.reload())}>
          <RefreshCw />
          {t('common.tryAgain')}
        </Button>
      ),
    },
    empty: {
      icon: <Inbox className="h-12 w-12 text-muted-foreground/50" />,
      title: t('empty.noNewsYet'),
      description: t('empty.newsWillAppear'),
      action: null,
    },
    loading: {
      icon: (
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
      ),
      title: t('common.loading'),
      description: t('empty.fetchingNews'),
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
