/**
 * Weekly Timeline Bar Component
 *
 * PURPOSE: Horizontal navigation for selecting weeks in My Feed
 *
 * DESIGN NOTES FOR DESIGNER:
 * - Horizontal scroll bar showing last 12 weeks
 * - Current week is highlighted/selected by default
 * - User can click on a week to view news from that period
 * - Arrow buttons for navigation (optional if using scroll)
 * - Visual indicator showing which week is currently selected
 *
 * EXAMPLE LAYOUT:
 * ◀ ─────[1/20-26]────[1/27-2/2]────[2/3-9]───── ▶
 *                                      ●
 *                                   current week
 *
 * This is a PLACEHOLDER implementation. The designer should:
 * 1. Create proper visual design matching the app's style
 * 2. Add animations for week selection
 * 3. Implement smooth scrolling behavior
 * 4. Add touch/drag support for mobile
 * 5. Consider accessibility (keyboard navigation, ARIA labels)
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Week {
  weekStart: string // ISO date string
  weekEnd: string // ISO date string
  label: string // Display label like "1/20-26"
  totalItems: number // Number of news items in this week
}

export interface WeeklyBarProps {
  /** Array of weeks to display (typically 12 weeks) */
  weeks: Week[]

  /** Index of currently selected week (0 = most recent) */
  selectedWeekIndex: number

  /** Callback when user selects a different week */
  onSelectWeek: (index: number) => void

  /** Optional className for custom styling */
  className?: string
}

/**
 * PLACEHOLDER Weekly Timeline Bar Component
 *
 * This is a basic implementation to demonstrate functionality.
 * The designer should replace this with a properly styled component.
 */
export function WeeklyBar({
  weeks,
  selectedWeekIndex,
  onSelectWeek,
  className,
}: WeeklyBarProps) {
  const handlePrevious = () => {
    if (selectedWeekIndex < weeks.length - 1) {
      onSelectWeek(selectedWeekIndex + 1)
    }
  }

  const handleNext = () => {
    if (selectedWeekIndex > 0) {
      onSelectWeek(selectedWeekIndex - 1)
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 border-b border-border bg-background/95 backdrop-blur',
        'sticky top-0 z-10 px-4 py-3',
        className
      )}
    >
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={selectedWeekIndex >= weeks.length - 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed'
        )}
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Weeks Container - Scrollable */}
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-min">
          {weeks.map((week, index) => {
            const isSelected = index === selectedWeekIndex
            const isCurrent = index === 0

            return (
              <button
                key={week.weekStart}
                onClick={() => onSelectWeek(index)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  'hover:bg-accent',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                  !isSelected && 'bg-card border border-border'
                )}
                aria-label={`Week of ${week.label}`}
                aria-current={isSelected ? 'true' : undefined}
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{week.label}</span>
                  {isCurrent && (
                    <span className="text-xs opacity-70">Current</span>
                  )}
                  {week.totalItems > 0 && (
                    <span className="text-xs opacity-70">
                      {week.totalItems} {week.totalItems === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={selectedWeekIndex <= 0}
        className={cn(
          'p-2 rounded-lg transition-colors',
          'hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed'
        )}
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * DESIGN IMPLEMENTATION CHECKLIST FOR DESIGNER:
 *
 * □ Replace basic button styles with custom design
 * □ Add smooth scroll animations when selecting weeks
 * □ Implement drag/swipe gestures for mobile
 * □ Add visual indicator (dot, line, etc.) for current week
 * □ Style the selected state with proper hover/focus states
 * □ Add loading skeleton state (when weeks data is loading)
 * □ Implement responsive design for mobile/tablet/desktop
 * □ Add keyboard navigation support (arrow keys)
 * □ Consider adding week range tooltips on hover
 * □ Test with different week label formats (edge cases)
 * □ Add empty state handling (no weeks available)
 * □ Optimize scroll performance for smooth UX
 */
