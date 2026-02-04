import { Link } from 'react-router-dom'
import { CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { DateDropdown } from './DateDropdown'
import type { Category } from '@/types/news'

interface FilterBarProps {
  currentCategory: Category | null
  onCategoryChange?: (category: Category | null) => void
  disabled?: boolean
  className?: string
  currentDate?: Date
  onDateSelect?: (date: Date) => void
}

const chipBase = cn(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium',
  'transition-all duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
  'h-7 px-3 text-xs'
)

const chipActive = 'bg-primary text-primary-foreground shadow-sm'
const chipInactive = 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground'

export function FilterBar({
  currentCategory,
  disabled = false,
  className,
  currentDate = new Date(),
  onDateSelect,
}: FilterBarProps) {
  return (
    <nav
      className={cn(
        'sticky top-[61px] z-10',
        'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'border-b border-border',
        'px-4 py-2.5',
        'flex items-center justify-between gap-4',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      role="group"
      aria-label="News filters"
    >
      {/* Category filters - scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
        <Link
          to="/timeline"
          className={cn(chipBase, !currentCategory ? chipActive : chipInactive)}
          aria-current={!currentCategory ? 'page' : undefined}
          aria-label="Show all categories"
        >
          All
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            to={`/${cat.id}`}
            className={cn(chipBase, currentCategory === cat.id ? chipActive : chipInactive)}
            aria-current={currentCategory === cat.id ? 'page' : undefined}
            aria-label={`Filter by ${cat.label} news`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Date dropdown - fixed on right */}
      {onDateSelect && (
        <DateDropdown
          currentDate={currentDate}
          onDateSelect={onDateSelect}
          className="shrink-0"
        />
      )}
    </nav>
  )
}
