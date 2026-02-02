import { Button } from '@/components/ui'
import { CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/news'

interface FilterBarProps {
  currentCategory: Category | null
  onCategoryChange: (category: Category | null) => void
  disabled?: boolean
  className?: string
}

export function FilterBar({
  currentCategory,
  onCategoryChange,
  disabled = false,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'border-b border-border px-4 py-3',
        'overflow-x-auto scrollbar-hide',
        'flex gap-2',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <Button
        variant={!currentCategory ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        All
      </Button>
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.id}
          variant={currentCategory === cat.id ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(cat.id)}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
