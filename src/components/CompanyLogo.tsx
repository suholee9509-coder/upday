import { cn } from '@/lib/utils'

interface CompanyLogoProps {
  companyId: string
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
}

// Companies that have SVG logos in /logos/
const AVAILABLE_LOGOS = [
  'amazon',
  'anthropic',
  'apple',
  'cloudflare',
  'cursor',
  'databricks',
  'discord',
  'figma',
  'github',
  'google',
  'linear',
  'meta',
  'microsoft',
  'mistral',
  'notion',
  'nvidia',
  'openai',
  'reddit',
  'shopify',
  'slack',
  'stripe',
  'supabase',
  'tesla',
  'vercel',
  'xai',
]

// Fallback component for companies without logos
function FallbackLogo({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center bg-muted rounded-md text-muted-foreground font-semibold text-[10px]', className)}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function CompanyLogo({ companyId, className, size = 'md' }: CompanyLogoProps) {
  const sizeClass = sizeClasses[size]
  const hasLogo = AVAILABLE_LOGOS.includes(companyId)

  if (!hasLogo) {
    return <FallbackLogo name={companyId} className={cn(sizeClass, className)} />
  }

  return (
    <img
      src={`/logos/${companyId}.svg`}
      alt={`${companyId} logo`}
      className={cn(sizeClass, 'object-contain', className)}
    />
  )
}

export function getCompanyLogo(companyId: string) {
  return AVAILABLE_LOGOS.includes(companyId) ? `/logos/${companyId}.svg` : null
}
