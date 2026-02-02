import { cn } from '@/lib/utils'

/**
 * Monet 테마 기반 Card. 프로젝트 전반 재사용.
 */
export function Card({ className, ...rest }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-none p-4',
        className
      )}
      {...rest}
    />
  )
}

export function CardHeader({ className, ...rest }) {
  return <div className={cn('flex flex-col space-y-1.5 pb-2', className)} {...rest} />
}

export function CardTitle({ className, ...rest }) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...rest} />
}

export function CardDescription({ className, ...rest }) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...rest} />
}

export function CardContent({ className, ...rest }) {
  return <div className={cn('pt-0', className)} {...rest} />
}

export function CardFooter({ className, ...rest }) {
  return <div className={cn('flex items-center pt-4', className)} {...rest} />
}
