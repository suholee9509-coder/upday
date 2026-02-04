import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Radio, ChevronRight, Star, Grid2X2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import { usePinnedCompanies } from '@/hooks/usePinnedCompanies'
import { COMPANIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface MobileNavSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavSheet({ isOpen, onClose }: MobileNavSheetProps) {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { pinnedCompanies, togglePin } = usePinnedCompanies()

  const currentCompany = searchParams.get('company')
  const isLiveFeed = location.pathname === '/timeline' && !currentCompany

  // Get pinned company details
  const pinnedCompanyDetails = pinnedCompanies
    .map(id => COMPANIES.find(c => c.id === id))
    .filter(Boolean)

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Menu">
      <nav className="p-4 space-y-6">
        {/* Feed Section */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            Feed
          </h3>
          <NavItem
            icon={<Radio className="h-5 w-5" />}
            label="Live Feed"
            description="All categories, real-time"
            href="/timeline"
            active={isLiveFeed}
            onClick={onClose}
          />
        </section>

        {/* Companies Section */}
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            Companies
          </h3>

          {/* Browse All */}
          <NavItem
            icon={<Grid2X2 className="h-5 w-5" />}
            label="Browse all"
            description="25+ tech companies"
            href="/timeline/companies"
            active={location.pathname === '/timeline/companies'}
            onClick={onClose}
            showArrow
          />

          {/* Pinned Companies */}
          {pinnedCompanyDetails.length > 0 && (
            <div className="pt-2 mt-2 border-t border-border space-y-1">
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Pinned ({pinnedCompanyDetails.length})
              </div>
              {pinnedCompanyDetails.map(company => company && (
                <CompanyItem
                  key={company.id}
                  company={company}
                  active={currentCompany === company.id}
                  onUnpin={() => togglePin(company.id)}
                  onClick={onClose}
                />
              ))}
            </div>
          )}

          {/* Empty Pinned State */}
          {pinnedCompanyDetails.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground bg-muted/30 rounded-lg">
              <p>No pinned companies yet.</p>
              <Link
                to="/timeline/companies"
                onClick={onClose}
                className="text-primary hover:underline"
              >
                Browse and pin companies
              </Link>
            </div>
          )}
        </section>
      </nav>
    </BottomSheet>
  )
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  description?: string
  href: string
  active?: boolean
  showArrow?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, description, href, active, showArrow, onClick }: NavItemProps) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl transition-colors',
        'active:scale-[0.98]',
        active
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted/50 text-foreground'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
        active ? 'bg-primary/20' : 'bg-muted'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground truncate">{description}</div>
        )}
      </div>
      {showArrow && (
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
    </Link>
  )
}

interface CompanyItemProps {
  company: { id: string; name: string }
  active?: boolean
  onUnpin: () => void
  onClick?: () => void
}

function CompanyItem({ company, active, onUnpin, onClick }: CompanyItemProps) {
  return (
    <div className="group relative flex items-center">
      <Link
        to={`/timeline?company=${company.id}`}
        onClick={onClick}
        className={cn(
          'flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          'active:scale-[0.98]',
          active
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-muted/50 text-foreground'
        )}
        aria-current={active ? 'page' : undefined}
      >
        {/* Company Initial */}
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0',
          active ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {company.name.charAt(0)}
        </div>
        <span className="truncate">{company.name}</span>
      </Link>

      {/* Unpin Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onUnpin()
        }}
        className={cn(
          'absolute right-2 p-2 rounded-lg',
          'text-primary/70 hover:text-primary hover:bg-primary/10',
          'transition-colors'
        )}
        aria-label={`Unpin ${company.name}`}
      >
        <Star className="h-4 w-4 fill-current" />
      </button>
    </div>
  )
}
