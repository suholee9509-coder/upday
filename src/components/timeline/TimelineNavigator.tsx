/**
 * Timeline Navigator - Vertical timeline for My Feed
 *
 * Simple left-side timeline with dots representing each week.
 * Active state indicated by color only.
 */

import { useEffect, useState } from 'react'
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
  className?: string
}

export function TimelineNavigator({
  weeks,
  activeWeekIndex,
  onWeekClick,
  className,
}: TimelineNavigatorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <nav
      className={cn(
        'fixed right-0 top-[110px] bottom-0 z-20',
        'w-[240px] bg-background/98 backdrop-blur-md',
        'border-l border-t border-border/50',
        'hidden md:flex flex-col',
        'py-8',
        'shadow-2xl shadow-black/5',
        className
      )}
      aria-label="Timeline navigation"
    >
      {/* Continuous vertical line background */}
      <div className="absolute left-[42px] top-8 bottom-8 w-[2px] bg-border" />

      <div className="flex-1 flex flex-col justify-start gap-6 overflow-y-auto scrollbar-thin relative pl-[37px] pr-8">
        {weeks.map((week, index) => {
          const isActive = index === activeWeekIndex
          const isHovered = index === hoveredIndex
          const isCurrent = index === 0

          return (
            <button
              key={week.weekStart}
              onClick={() => onWeekClick(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'group relative flex items-start gap-4 text-left',
                'transition-all duration-300 ease-out',
                'hover:-translate-x-1',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-lg',
                'py-1'
              )}
              aria-label={`Jump to week of ${week.label}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center pt-0.5 shrink-0">
                <div className="relative">
                  {/* Glow ring for active state */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-sm scale-[2] animate-pulse" />
                  )}

                  <div
                    className={cn(
                      'relative w-2.5 h-2.5 rounded-full z-10',
                      'border-2 transition-all duration-300 ease-out',
                      'shadow-sm',
                      isActive
                        ? 'bg-primary border-primary scale-[1.4] shadow-primary/30'
                        : isCurrent
                        ? 'bg-primary/80 border-primary/80 shadow-primary/20'
                        : 'bg-background border-border group-hover:border-primary/60 group-hover:scale-125 group-hover:bg-primary/5'
                    )}
                  >
                    {/* Current week pulse indicator */}
                    {isCurrent && !isActive && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Week info with enhanced typography */}
              <div className="flex-1 min-w-0 pt-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-sm font-semibold transition-all duration-300 truncate',
                      isActive
                        ? 'text-foreground'
                        : isCurrent
                        ? 'text-foreground/90'
                        : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    {week.label}
                  </p>
                  {isCurrent && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                      Now
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1 overflow-hidden">
                  <p
                    className={cn(
                      'text-xs transition-colors duration-300 truncate',
                      isActive
                        ? 'text-muted-foreground font-medium'
                        : 'text-muted-foreground/70'
                    )}
                  >
                    {week.totalItems} {week.totalItems === 1 ? 'article' : 'articles'}
                  </p>
                  {week.totalItems > 0 && isActive && (
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
