import { Pin } from 'lucide-react'
import { Button } from '@/components/ui'
import { DateDropdown } from './DateDropdown'
import { CompanyLogo } from '@/components/CompanyLogo'
import { usePinnedCompanies } from '@/hooks/usePinnedCompanies'
import { COMPANIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface CompanyFeedHeaderProps {
  companyId: string
  articleCount?: number
  currentDate?: Date
  onDateSelect?: (date: Date) => void
}

export function CompanyFeedHeader({
  companyId,
  articleCount,
  currentDate = new Date(),
  onDateSelect,
}: CompanyFeedHeaderProps) {
  const { isPinned, togglePin } = usePinnedCompanies()
  const company = COMPANIES.find(c => c.id === companyId)
  const pinned = isPinned(companyId)

  if (!company) return null

  return (
    <div className="sticky top-[57px] md:top-[61px] z-10 -mt-px border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Company Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Company Logo */}
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              pinned
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'
            )}>
              <CompanyLogo companyId={companyId} size="md" />
            </div>

            {/* Name and Stats */}
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground truncate">
                {company.name}
              </h1>
              {articleCount !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                </p>
              )}
            </div>
          </div>

          {/* Right section: Date + Pin */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Date Dropdown */}
            {onDateSelect && (
              <DateDropdown
                currentDate={currentDate}
                onDateSelect={onDateSelect}
              />
            )}

            {/* Pin Button */}
            <Button
              variant={pinned ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => togglePin(companyId)}
              className={cn(
                'gap-1.5',
                pinned && 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              )}
            >
              <Pin className={cn('!size-3.5 rotate-45', pinned && 'fill-current')} strokeWidth={1.5} />
              {pinned ? 'Pinned' : 'Pin'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
