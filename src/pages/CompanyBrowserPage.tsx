import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Pin } from 'lucide-react'
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
import { SEO } from '@/components/SEO'
import { CompanyLogo } from '@/components/CompanyLogo'
import { usePinnedCompanies } from '@/hooks/usePinnedCompanies'
import { COMPANIES, COMPANY_GROUPS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function CompanyBrowserPage() {
  const { pinnedCompanies, isPinned, togglePin } = usePinnedCompanies()

  // Get pinned company objects
  const pinnedCompanyObjects = useMemo(() => {
    return pinnedCompanies
      .map(id => COMPANIES.find(c => c.id === id))
      .filter(Boolean)
  }, [pinnedCompanies])

  // Group companies by group
  const groupedCompanies = useMemo(() => {
    return COMPANY_GROUPS.map(group => ({
      ...group,
      companies: COMPANIES.filter(c => c.group === group.id),
    })).filter(g => g.companies.length > 0)
  }, [])

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <SEO
          title="Browse Companies"
          description="Browse and pin companies to track their news. 25+ tech companies organized by category."
          url="/timeline/companies"
        />

        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header
            showLogo={false}
            showMobileMenu={true}
            pageTitle="Companies"
            pageDescription="Browse and pin companies"
          />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-foreground">Browse Companies</h1>
                <p className="text-muted-foreground mt-1">
                  Pin companies to track their news in your sidebar
                </p>
              </div>

              {/* Pinned Section */}
              {pinnedCompanyObjects.length > 0 && (
                <section>
                  <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-normal mb-3">
                    Pinned ({pinnedCompanyObjects.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pinnedCompanyObjects.map(company => company && (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        isPinned={true}
                        onTogglePin={() => togglePin(company.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Company Groups */}
              {groupedCompanies.map(group => (
                <section key={group.id}>
                  <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-normal mb-3">
                    {group.label}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {group.companies.map(company => (
                      <CompanyCard
                        key={company.id}
                        company={company}
                        isPinned={isPinned(company.id)}
                        onTogglePin={() => togglePin(company.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

interface CompanyCardProps {
  company: { id: string; name: string }
  isPinned: boolean
  onTogglePin: () => void
}

function CompanyCard({ company, isPinned, onTogglePin }: CompanyCardProps) {
  return (
    <div className="group relative">
      <Link
        to={`/timeline?company=${company.id}`}
        className={cn(
          'block p-4 rounded-lg border transition-[border-color,box-shadow] duration-150',
          'hover:border-primary/50 hover:shadow-sm',
          isPinned
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-card'
        )}
      >
        {/* Company Logo */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
          isPinned
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        )}>
          <CompanyLogo companyId={company.id} size="md" />
        </div>

        {/* Company Name */}
        <div className="font-medium text-foreground truncate pr-6">
          {company.name}
        </div>
      </Link>

      {/* Pin Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onTogglePin()
        }}
        className={cn(
          'absolute top-3 right-3 p-1.5 rounded-md transition-[opacity,color,background-color] duration-150',
          isPinned
            ? 'text-primary hover:bg-primary/10'
            : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
        )}
        aria-label={isPinned ? `Unpin ${company.name}` : `Pin ${company.name}`}
      >
        <Pin className={cn('h-3.5 w-3.5 rotate-45', isPinned && 'fill-current')} strokeWidth={1.5} />
      </button>
    </div>
  )
}
