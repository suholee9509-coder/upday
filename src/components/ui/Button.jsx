import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90 active:opacity-95 font-medium rounded-lg px-4 py-2 text-sm transition-opacity',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 font-normal rounded-lg px-3 py-1.5 text-sm border border-border',
  ghost:
    'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground font-medium rounded-lg px-3 py-2 text-sm transition-colors',
  destructive:
    'bg-destructive text-destructive-foreground hover:opacity-90 font-medium rounded-lg px-4 py-2 text-sm transition-opacity',
  outline:
    'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground font-medium rounded-lg px-4 py-2 text-sm transition-colors',
}

const sizes = {
  sm: 'h-8 text-xs px-3',
  default: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
  icon: 'h-9 w-9 p-0',
}

/**
 * Monet 테마 기반 Button. 프로젝트 전반 재사용.
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'destructive'|'outline'} [props.variant]
 * @param {'sm'|'default'|'lg'|'icon'} [props.size]
 * @param {string} [props.className]
 */
export function Button({
  variant = 'primary',
  size = 'default',
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
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
