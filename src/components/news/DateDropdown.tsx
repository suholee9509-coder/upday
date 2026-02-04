import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateDropdownProps {
  currentDate: Date
  onDateSelect: (date: Date) => void
  className?: string
}

// Generate last 7 days
function getLast7Days(): Date[] {
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push(date)
  }

  return days
}

// Format date for display
function formatDateLabel(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today'
  }

  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }

  // Same year: "Feb 2"
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Different year: "Dec 31, 2025"
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function DateDropdown({ currentDate, onDateSelect, className }: DateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const days = getLast7Days()

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (date: Date) => {
    onDateSelect(date)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Text Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium',
          'text-muted-foreground hover:text-foreground',
          'focus-visible:outline-none focus-visible:text-foreground'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select date"
      >
        <span>{formatDateLabel(currentDate)}</span>
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Panel - shadcn style */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50',
            'w-[130px] p-1',
            'bg-popover border border-border rounded-md',
            'shadow-md',
            'animate-in fade-in-0 slide-in-from-top-2 duration-150'
          )}
          role="listbox"
          aria-label="Date options"
        >
          {days.map((date) => {
            const isSelected = isSameDay(date, currentDate)
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleSelect(date)}
                className={cn(
                  'relative w-full flex items-center rounded-sm px-2 py-1.5 text-xs',
                  'cursor-pointer select-none outline-none',
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <span className="flex-1">{formatDateLabel(date)}</span>
                {isSelected && (
                  <Check className="h-3 w-3 text-foreground/70" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Export helper for use in scroll detection
export { formatDateLabel, isSameDay }
