import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Radio, ChevronRight, ChevronLeft, ChevronUp, Pin, Grid2X2, Menu, X, LogIn, Settings, LogOut, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { CompanyLogo } from '@/components/CompanyLogo'
import { UpdayWordmark } from '@/components/UpdayLogo'
import { usePinnedCompanies } from '@/hooks/usePinnedCompanies'
import { useAuth } from '@/hooks/useAuth'
import { COMPANIES } from '@/lib/constants'

// Soft spring animation
const springTransition = 'transition-all duration-300 ease-[cubic-bezier(0.25,1.1,0.4,1)]'

// Sidebar Context
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

// Mobile Menu Button
export function MobileMenuButton() {
  const { t } = useTranslation()
  const { isMobileOpen, setIsMobileOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      aria-label={isMobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
      aria-expanded={isMobileOpen}
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )
}

// Main Sidebar
export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()
  const { pinnedCompanies, togglePin } = usePinnedCompanies()
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth()
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(false) // Default collapsed
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  const currentCompany = searchParams.get('company')
  const isLiveFeed = location.pathname === '/timeline' && !currentCompany

  const handleSignIn = () => {
    window.dispatchEvent(new CustomEvent('open-login-modal'))
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMobileOpen(false)
  }

  const pinnedCompanyDetails = useMemo(() =>
    pinnedCompanies
      .map(slug => COMPANIES.find(c => c.id === slug))
      .filter(Boolean),
    [pinnedCompanies]
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={cn('fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden', springTransition)}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen',
          'bg-sidebar border-r border-sidebar-border',
          'flex flex-col',
          springTransition,
          // Desktop
          'md:sticky md:top-0 md:z-30',
          isCollapsed ? 'md:w-[60px]' : 'md:w-[240px]',
          // Mobile
          'w-[280px] -translate-x-full md:translate-x-0',
          isMobileOpen && 'translate-x-0'
        )}
      >
        {/* Header - Logo & Toggle */}
        <div className={cn(
          'h-[61px] flex items-center border-b border-sidebar-border/50',
          springTransition,
          isCollapsed ? 'justify-center px-2' : 'px-4'
        )}>
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              'text-sidebar-foreground hover:opacity-80',
              springTransition,
              isCollapsed && 'hidden'
            )}
          >
            <UpdayWordmark size="sm" />
          </Link>

          {/* Collapse Toggle - Desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'hidden md:flex items-center justify-center w-8 h-8 rounded-md shrink-0',
              'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
              springTransition,
              !isCollapsed && 'ml-auto'
            )}
            aria-label={isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          >
            <ChevronLeft className={cn(
              'h-4 w-4',
              springTransition,
              isCollapsed && 'rotate-180'
            )} />
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden ml-auto p-2 text-muted-foreground hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent"
            aria-label={t('nav.closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          'flex-1 overflow-y-auto py-4 scrollbar-hide',
          springTransition,
          isCollapsed ? 'px-2' : 'px-3'
        )}>
          {/* Main Section */}
          <div className="space-y-1">
            <SectionTitle collapsed={isCollapsed}>{t('nav.feed')}</SectionTitle>

            <NavItem
              icon={<Radio className="h-4 w-4" />}
              label={t('nav.liveFeed')}
              href="/timeline"
              active={isLiveFeed}
              collapsed={isCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />

            <NavItem
              icon={<Grid2X2 className="h-4 w-4" />}
              label={t('nav.companies')}
              href="/timeline/companies"
              active={location.pathname === '/timeline/companies'}
              collapsed={isCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />
          </div>

          {/* Pinned Section - hidden when collapsed */}
          {!isCollapsed && (
          <div className="mt-6 space-y-1">
            <ExpandableSection
              title={t('nav.pinned')}
              isExpanded={isPinnedExpanded}
              onToggle={() => setIsPinnedExpanded(!isPinnedExpanded)}
              collapsed={isCollapsed}
              count={pinnedCompanyDetails.length}
            >
              {pinnedCompanyDetails.length > 0 ? (
                pinnedCompanyDetails.map(company => company && (
                  <CompanyItem
                    key={company.id}
                    company={company}
                    active={currentCompany === company.id}
                    collapsed={isCollapsed}
                    onUnpin={() => togglePin(company.id)}
                    onClick={() => setIsMobileOpen(false)}
                    unpinLabel={t('aria.unpin', { name: company.name })}
                  />
                ))
              ) : (
                <div className={cn(
                  'text-xs text-muted-foreground/70 italic',
                  springTransition,
                  isCollapsed ? 'hidden' : 'px-2 py-2'
                )}>
                  {t('nav.noPinnedCompanies')}
                </div>
              )}
            </ExpandableSection>
          </div>
          )}

          {/* My Feed Section */}
          <div className="mt-6 space-y-1">
            <SectionTitle collapsed={isCollapsed}>{t('nav.personal')}</SectionTitle>

            <NavItem
              icon={<Zap className="h-4 w-4" />}
              label={t('nav.myFeed')}
              href={isAuthenticated ? '/timeline/my' : '#'}
              active={location.pathname === '/timeline/my'}
              collapsed={isCollapsed}
              onClick={() => {
                if (!isAuthenticated) {
                  handleSignIn()
                } else {
                  setIsMobileOpen(false)
                }
              }}
            />
          </div>
        </nav>

        {/* User Section - Bottom */}
        <div className={cn(
          'border-t border-sidebar-border/50',
          springTransition,
          isCollapsed ? 'p-2' : 'p-3'
        )}>
          {authLoading ? (
            <div className={cn(
              'flex items-center rounded-lg',
              isCollapsed ? 'h-10 justify-center' : 'h-12 px-3 gap-3'
            )}>
              <div className="w-8 h-8 rounded-full bg-sidebar-accent animate-pulse" />
              {!isCollapsed && (
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-20 bg-sidebar-accent rounded animate-pulse" />
                  <div className="h-2 w-28 bg-sidebar-accent rounded animate-pulse" />
                </div>
              )}
            </div>
          ) : isAuthenticated && user ? (
            <div className="relative">
              {/* Backdrop - click to close */}
              {!isCollapsed && (
                <div
                  className={cn(
                    'fixed inset-0 z-40 transition-opacity duration-200',
                    isAccountMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  )}
                  onClick={() => setIsAccountMenuOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* Dropdown Menu - appears above with animation */}
              {!isCollapsed && (
                <div className={cn(
                  'absolute bottom-full left-0 right-0 mb-2 z-50',
                  'bg-sidebar border border-sidebar-border/50 rounded-lg',
                  'shadow-lg',
                  'p-1',
                  'transition-all duration-200 ease-out',
                  'origin-bottom',
                  isAccountMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
                )}>
                  <Link
                    to="/settings"
                    onClick={() => {
                      setIsMobileOpen(false)
                      setIsAccountMenuOpen(false)
                    }}
                    className={cn(
                      'flex items-center gap-2 h-9 px-3 rounded-md',
                      'text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                      springTransition
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('nav.settings')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsAccountMenuOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 h-9 px-3 rounded-md',
                      'text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                      springTransition
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </div>
              )}

              {/* Account Menu - Click to toggle dropdown */}
              <button
                onClick={() => !isCollapsed && setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={cn(
                  'w-full flex items-center rounded-lg',
                  'hover:bg-sidebar-accent/50',
                  springTransition,
                  isCollapsed ? 'h-10 justify-center' : 'h-12 px-3 gap-3'
                )}
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {(user.user_metadata?.name || user.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <ChevronUp
                      className={cn(
                        'h-4 w-4 text-muted-foreground shrink-0',
                        springTransition,
                        isAccountMenuOpen && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className={cn(
                'w-full flex items-center rounded-lg',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                springTransition,
                isCollapsed ? 'h-10 justify-center' : 'h-10 px-3 gap-3'
              )}
            >
              <LogIn className="h-4 w-4" />
              <span className={cn(
                'text-sm font-medium',
                springTransition,
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              )}>
                {t('nav.signIn')}
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

// Section Title
function SectionTitle({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  return (
    <div className={cn(
      'overflow-hidden',
      springTransition,
      collapsed ? 'h-0 opacity-0' : 'h-8 opacity-100'
    )}>
      <h3 className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground/80 uppercase tracking-normal">
        {children}
      </h3>
    </div>
  )
}

// Expandable Section
function ExpandableSection({
  title,
  isExpanded,
  onToggle,
  collapsed,
  count,
  children,
}: {
  title: string
  isExpanded: boolean
  onToggle: () => void
  collapsed: boolean
  count?: number
  children: ReactNode
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center rounded-lg',
          'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
          springTransition,
          collapsed ? 'h-10 justify-center' : 'h-10 px-3 gap-2'
        )}
        aria-expanded={isExpanded}
      >
        {!collapsed && (
          <>
            <span className="text-left text-[11px] font-medium uppercase tracking-normal">
              {title}
            </span>
            {count !== undefined && (
              <span className="text-[10px] text-muted-foreground/60 font-medium">
                {count}
              </span>
            )}
          </>
        )}
        <ChevronRight className={cn(
          'h-3 w-3',
          springTransition,
          isExpanded ? '-rotate-90' : 'rotate-90',
          !collapsed && 'ml-auto'
        )} />
      </button>

      <div className={cn(
        'overflow-hidden',
        springTransition,
        isExpanded && !collapsed ? 'max-h-[400px] opacity-100 mt-1' : 'max-h-0 opacity-0'
      )}>
        <div className="space-y-0.5">
          {children}
        </div>
      </div>
    </div>
  )
}

// Nav Item
interface NavItemProps {
  icon: ReactNode
  label: string
  href: string
  active?: boolean
  collapsed?: boolean
  onClick?: () => void
  indent?: boolean
}

function NavItem({ icon, label, href, active, collapsed, onClick, indent }: NavItemProps) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        'flex items-center rounded-lg',
        springTransition,
        active
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
        collapsed
          ? 'h-10 justify-center'
          : cn('h-10 px-3 gap-3', indent && 'pl-6')
      )}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      <span className={cn(
        'flex-shrink-0',
        active ? 'text-sidebar-accent-foreground' : 'text-muted-foreground'
      )}>
        {icon}
      </span>
      <span className={cn(
        'text-sm font-medium truncate',
        springTransition,
        collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
      )}>
        {label}
      </span>
    </Link>
  )
}

// Company Item
interface CompanyItemProps {
  company: { id: string; name: string }
  active?: boolean
  collapsed?: boolean
  onUnpin: () => void
  onClick?: () => void
  unpinLabel?: string
}

function CompanyItem({ company, active, collapsed, onUnpin, onClick, unpinLabel }: CompanyItemProps) {
  return (
    <div className="relative group">
      <Link
        to={`/timeline?company=${company.id}`}
        onClick={onClick}
        className={cn(
          'flex items-center rounded-lg',
          springTransition,
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
          collapsed ? 'h-10 justify-center' : 'h-10 px-3 gap-3 pr-10'
        )}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? company.name : undefined}
      >
        <CompanyLogo
          companyId={company.id}
          size="xs"
          className={cn(
            'flex-shrink-0',
            active ? 'text-sidebar-accent-foreground' : 'text-muted-foreground'
          )}
        />
        <span className={cn(
          'text-sm font-medium truncate',
          springTransition,
          collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        )}>
          {company.name}
        </span>
      </Link>

      {/* Unpin button - CSS hover instead of useState */}
      {!collapsed && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onUnpin()
          }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md',
            'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150'
          )}
          aria-label={unpinLabel || `Unpin ${company.name}`}
        >
          <Pin className="h-3 w-3 rotate-45" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
