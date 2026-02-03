import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]',
  secondary:
    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 border border-border/50',
  ghost:
    'hover:bg-accent hover:text-accent-foreground',
  destructive:
    'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]',
  outline:
    'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  link:
    'text-primary underline-offset-4 hover:underline',
}

const sizes = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  default: 'h-8 px-3.5 py-1.5 text-sm gap-2',
  lg: 'h-10 px-6 text-base gap-2',
  icon: 'h-8 w-8',
}

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', size = 'default', className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          variants[variant],
          sizes[size],
          className
        )}
        {...rest}
      >
        {children}
      </button>
    )
  }
)
