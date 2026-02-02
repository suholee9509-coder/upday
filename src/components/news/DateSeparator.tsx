import { memo } from 'react'
import { formatDateSeparator, cn } from '@/lib/utils'

interface DateSeparatorProps {
  date: string
  className?: string
}

export const DateSeparator = memo(function DateSeparator({ date, className }: DateSeparatorProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 px-4 py-2.5',
        'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'border-b border-border',
        className
      )}
    >
      <span className="text-sm font-medium text-muted-foreground">
        {formatDateSeparator(date)}
      </span>
    </div>
  )
})
