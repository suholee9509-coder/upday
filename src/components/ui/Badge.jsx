import { cn } from '@/lib/utils'

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'text-foreground border-border',
  muted: 'border-transparent bg-muted text-muted-foreground',
}

/**
 * Monet 테마 기반 Badge. 프로젝트 전반 재사용.
 * @param {'default'|'secondary'|'destructive'|'outline'|'muted'} [variant]
 */
export function Badge({ variant = 'default', className, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      {...rest}
    />
  )
}
