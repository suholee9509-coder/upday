/**
 * Timeline Navigator - Vertical timeline for My Feed
 *
 * Simple left-side timeline with dots representing each week.
 * Active state indicated by color only.
 */

import { cn } from '@/lib/utils'

export interface TimelineWeek {
  weekStart: string
  weekEnd: string
  label: string
  totalItems: number
}

interface TimelineNavigatorProps {
  weeks: TimelineWeek[]
  activeWeekIndex: number
  onWeekClick: (index: number) => void
}

export function TimelineNavigator({
  weeks,
  activeWeekIndex,
  onWeekClick,
}: TimelineNavigatorProps) {
  return (
    <>
      {/* Desktop only: Vertical timeline on right */}
      <nav
        className={cn(
          'fixed right-0 top-[112px] bottom-0 z-20',
          'w-60 bg-background/98 backdrop-blur-md',
          'border-l border-t border-border/50',
          'hidden md:flex flex-col',
          'shadow-[0_8px_16px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.04)]',
          'dark:shadow-[0_8px_24px_rgba(0,0,0,0.24),0_0_1px_rgba(0,0,0,0.24)]',
        )}
        aria-label="Timeline navigation"
      >
      {/* Continuous vertical line background */}
      <div className="absolute left-10 top-0 bottom-0 w-px bg-border/90" />

      <div className="flex-1 flex flex-col justify-start gap-6 overflow-y-auto scrollbar-subtle relative pr-8 py-8">
        {weeks.map((week, index) => {
          const isActive = index === activeWeekIndex
          const isCurrent = index === 0

          return (
            <button
              key={week.weekStart}
              onClick={() => onWeekClick(index)}
              className={cn(
                'group relative flex items-start text-left w-full',
                'transition-all duration-300 ease-out',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg',
                'py-1 pl-14'
              )}
              aria-label={`Jump to week of ${week.label}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Timeline dot - absolutely positioned for perfect alignment */}
              <div className="absolute left-10 top-1 -translate-x-1/2">
                <div className="relative">
                  {/* Glow ring for active state */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm scale-[1.8] animate-pulse" />
                  )}

                  <div
                    className={cn(
                      'relative w-2 h-2 rounded-full z-10',
                      'border-2 transition-all duration-300 ease-out',
                      'shadow-sm',
                      isActive
                        ? 'bg-primary border-primary scale-110 shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                        : 'bg-background border-border/80 group-hover:border-primary/60 group-hover:scale-110 group-hover:bg-primary/10'
                    )}
                  />
                </div>
              </div>

              {/* Week info with enhanced typography */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-sm font-semibold leading-5 transition-all duration-300 truncate',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground group-hover:text-foreground group-hover:font-semibold'
                    )}
                  >
                    {week.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-primary/15 text-primary">
                      Now
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-4 transition-colors duration-300 truncate mt-1',
                    isActive
                      ? 'text-muted-foreground font-medium'
                      : 'text-muted-foreground/70 group-hover:text-muted-foreground'
                  )}
                >
                  {week.totalItems} {week.totalItems === 1 ? 'article' : 'articles'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
    </>
  )
}
