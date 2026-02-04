import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Radio, ChevronRight, ChevronLeft, Pin, Grid2X2, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { CompanyLogo } from '@/components/CompanyLogo'
import { UpdayWordmark } from '@/components/UpdayLogo'
import { usePinnedCompanies } from '@/hooks/usePinnedCompanies'
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
  const { isMobileOpen, setIsMobileOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isMobileOpen}
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )
}

// Main Sidebar
export function Sidebar() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()
  const { pinnedCompanies, togglePin } = usePinnedCompanies()
  const [isPinnedExpanded, setIsPinnedExpanded] = useState(true)

  const currentCompany = searchParams.get('company')
  const isLiveFeed = location.pathname === '/timeline' && !currentCompany

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
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
            aria-label="Close menu"
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
            <SectionTitle collapsed={isCollapsed}>Feed</SectionTitle>

            <NavItem
              icon={<Radio className="h-4 w-4" />}
              label="Live Feed"
              href="/timeline"
              active={isLiveFeed}
              collapsed={isCollapsed}
              onClick={() => setIsMobileOpen(false)}
            />

            <NavItem
              icon={<Grid2X2 className="h-4 w-4" />}
              label="Companies"
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
              title="Pinned"
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
                  />
                ))
              ) : (
                <div className={cn(
                  'text-xs text-muted-foreground/70 italic',
                  springTransition,
                  isCollapsed ? 'hidden' : 'px-2 py-2'
                )}>
                  No pinned companies
                </div>
              )}
            </ExpandableSection>
          </div>
          )}
        </nav>

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
          collapsed ? 'h-10 justify-center' : 'h-8 px-2 gap-2'
        )}
        aria-expanded={isExpanded}
      >
        <ChevronRight className={cn(
          'h-3 w-3',
          springTransition,
          isExpanded && 'rotate-90'
        )} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-[11px] font-medium uppercase tracking-normal">
              {title}
            </span>
            {count !== undefined && count > 0 && (
              <span className="text-[10px] text-muted-foreground/60 font-medium">
                {count}
              </span>
            )}
          </>
        )}
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
}

function CompanyItem({ company, active, collapsed, onUnpin, onClick }: CompanyItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/timeline?company=${company.id}`}
        onClick={onClick}
        className={cn(
          'flex items-center rounded-lg',
          springTransition,
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
          collapsed ? 'h-10 justify-center' : 'h-10 px-3 gap-3'
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

      {/* Unpin button */}
      {isHovered && !collapsed && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onUnpin()
          }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md',
            'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
            springTransition
          )}
          aria-label={`Unpin ${company.name}`}
        >
          <Pin className="h-3 w-3 rotate-45" strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
