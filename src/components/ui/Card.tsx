import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  children?: ReactNode
}

export function Card({ className, hover = false, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground',
        'shadow-sm transition-all duration-200',
        hover && 'hover:shadow-md hover:border-border/80 cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function CardHeader({ className, children, ...rest }: CardSectionProps) {
  return <div className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)} {...rest}>{children}</div>
}

export function CardTitle({ className, children, ...rest }: CardSectionProps) {
  return <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...rest}>{children}</h3>
}

export function CardDescription({ className, children, ...rest }: CardSectionProps) {
  return <p className={cn('text-sm text-muted-foreground leading-relaxed', className)} {...rest}>{children}</p>
}

export function CardContent({ className, children, ...rest }: CardSectionProps) {
  return <div className={cn('p-6 pt-0', className)} {...rest}>{children}</div>
}

export function CardFooter({ className, children, ...rest }: CardSectionProps) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...rest}>{children}</div>
}
