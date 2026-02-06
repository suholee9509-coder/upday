/**
 * Weekly Timeline Range Slider Component
 *
 * Interactive range slider for selecting a week range in My Feed.
 * Direction: Right (recent) → Left (past)
 */

import { useState, useRef, useCallback, useEffect } from 'react'
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

  /** Index of range start (0 = most recent) */
  selectedStartIndex: number

  /** Index of range end (0 = most recent) */
  selectedEndIndex: number

  /** Callback when user selects a different range */
  onRangeSelect: (startIndex: number, endIndex: number) => void

  /** Optional className for custom styling */
  className?: string
}

type DragHandle = 'start' | 'end' | null

export function WeeklyBar({
  weeks,
  selectedStartIndex,
  selectedEndIndex,
  onRangeSelect,
  className,
}: WeeklyBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [draggingHandle, setDraggingHandle] = useState<DragHandle>(null)
  const [tempStart, setTempStart] = useState(selectedStartIndex)
  const [tempEnd, setTempEnd] = useState(selectedEndIndex)

  // Sync with props when not dragging
  useEffect(() => {
    if (!draggingHandle) {
      setTempStart(selectedStartIndex)
      setTempEnd(selectedEndIndex)
    }
  }, [selectedStartIndex, selectedEndIndex, draggingHandle])

  const getIndexFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return 0

      const rect = trackRef.current.getBoundingClientRect()
      const relativeX = clientX - rect.left
      const percentage = Math.max(0, Math.min(1, relativeX / rect.width))

      // Convert to week index (reversed: right=0, left=max)
      const index = Math.round((1 - percentage) * (weeks.length - 1))
      return Math.max(0, Math.min(weeks.length - 1, index))
    },
    [weeks.length]
  )

  const handlePointerDown = (handle: 'start' | 'end') => (e: React.PointerEvent) => {
    e.preventDefault()
    setDraggingHandle(handle)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingHandle) return

      const newIndex = getIndexFromPosition(e.clientX)

      if (draggingHandle === 'start') {
        // Start handle cannot go past end handle
        setTempStart(Math.min(newIndex, tempEnd))
      } else {
        // End handle cannot go before start handle
        setTempEnd(Math.max(newIndex, tempStart))
      }
    },
    [draggingHandle, getIndexFromPosition, tempStart, tempEnd]
  )

  const handlePointerUp = useCallback(() => {
    if (draggingHandle) {
      onRangeSelect(tempStart, tempEnd)
      setDraggingHandle(null)
    }
  }, [draggingHandle, tempStart, tempEnd, onRangeSelect])

  useEffect(() => {
    if (draggingHandle) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [draggingHandle, handlePointerMove, handlePointerUp])

  // Calculate positions (reversed layout)
  const getPosition = (index: number) => {
    return ((weeks.length - 1 - index) / (weeks.length - 1)) * 100
  }

  const startPos = getPosition(draggingHandle ? tempStart : selectedStartIndex)
  const endPos = getPosition(draggingHandle ? tempEnd : selectedEndIndex)

  return (
    <nav
      className={cn(
        'sticky top-[57px] md:top-[61px] z-10 -mt-px',
        'bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'border-b border-border',
        'px-6 py-4',
        className
      )}
      role="group"
      aria-label="Week range navigation"
    >
      <div className="max-w-5xl mx-auto">
        {/* Week Labels */}
        <div className="relative mb-8">
          <div className="flex justify-between text-xs text-muted-foreground">
            {weeks.map((week, index) => {
              const isInRange =
                draggingHandle
                  ? index >= tempStart && index <= tempEnd
                  : index >= selectedStartIndex && index <= selectedEndIndex
              const isCurrent = index === 0

              return (
                <div
                  key={week.weekStart}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-colors',
                    isInRange ? 'text-foreground font-medium' : 'text-muted-foreground/60'
                  )}
                  style={{ flex: 1 }}
                >
                  <span className="whitespace-nowrap">{week.label}</span>
                  {isCurrent && (
                    <span className="w-1 h-1 bg-primary rounded-full" aria-label="Current week" />
                  )}
                  {week.totalItems > 0 && isInRange && (
                    <span className="text-[10px] text-muted-foreground">
                      {week.totalItems}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Timeline Track */}
        <div className="relative" ref={trackRef}>
          {/* Background Track */}
          <div className="h-1 bg-muted rounded-full" />

          {/* Active Range */}
          <div
            className="absolute top-0 h-1 bg-primary rounded-full transition-all duration-150"
            style={{
              left: `${Math.min(startPos, endPos)}%`,
              right: `${100 - Math.max(startPos, endPos)}%`,
            }}
          />

          {/* Start Handle (most recent) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-150"
            style={{ left: `${startPos}%` }}
          >
            <button
              onPointerDown={handlePointerDown('start')}
              className={cn(
                'w-5 h-5 rounded-full border-2 border-primary bg-background',
                'shadow-md hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'cursor-grab active:cursor-grabbing',
                'transition-all duration-150',
                draggingHandle === 'start' && 'scale-125 shadow-xl'
              )}
              aria-label="Start week handle"
            >
              <div className="w-full h-full rounded-full bg-primary" />
            </button>
          </div>

          {/* End Handle (most past) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-150"
            style={{ left: `${endPos}%` }}
          >
            <button
              onPointerDown={handlePointerDown('end')}
              className={cn(
                'w-5 h-5 rounded-full border-2 border-primary bg-background',
                'shadow-md hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'cursor-grab active:cursor-grabbing',
                'transition-all duration-150',
                draggingHandle === 'end' && 'scale-125 shadow-xl'
              )}
              aria-label="End week handle"
            >
              <div className="w-full h-full rounded-full bg-primary" />
            </button>
          </div>
        </div>

        {/* Range Info */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          {selectedStartIndex === selectedEndIndex ? (
            <span>
              Week of <span className="text-foreground font-medium">{weeks[selectedStartIndex]?.label}</span>
            </span>
          ) : (
            <span>
              <span className="text-foreground font-medium">{weeks[selectedStartIndex]?.label}</span>
              {' → '}
              <span className="text-foreground font-medium">{weeks[selectedEndIndex]?.label}</span>
              {' '}
              ({selectedEndIndex - selectedStartIndex + 1} weeks)
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}
