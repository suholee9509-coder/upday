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
        'px-4 py-2.5',
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
