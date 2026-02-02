import { Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'

interface NewsCardSkeletonProps {
  className?: string
}

export function NewsCardSkeleton({ className }: NewsCardSkeletonProps) {
  return (
    <div className={cn('p-4 border-b border-border', className)}>
      {/* Title skeleton */}
      <Skeleton className="h-5 w-4/5 mb-2" />

      {/* Summary skeleton - 2 lines */}
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-2/3 mb-3" />

      {/* Metadata skeleton */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-3.5 w-14" />
        <Skeleton className="h-5 w-10 rounded-md" />
      </div>

      {/* Source skeleton */}
      <Skeleton className="h-3.5 w-24" />
    </div>
  )
}
