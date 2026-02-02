import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground shadow-sm',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm',
  outline: 'text-foreground border-border bg-background',
  muted: 'border-transparent bg-muted text-muted-foreground',
  // Category color badges
  ai: 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  startup: 'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  science: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  design: 'border-transparent bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  space: 'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  dev: 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
}

type BadgeVariant = keyof typeof variants

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children?: ReactNode
}

export function Badge({ variant = 'default', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-150',
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
