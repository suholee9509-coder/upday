import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Monet 테마 기반 Input. 프로젝트 전반 재사용.
 */
const Input = forwardRef(function Input({ className, type = 'text', ...rest }, ref) {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
})

export { Input }
