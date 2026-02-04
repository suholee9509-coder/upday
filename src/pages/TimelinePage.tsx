import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
import { FilterBar, TimelineFeed, CompanyFeedHeader } from '@/components/news'
import type { TimelineFeedRef } from '@/components/news/TimelineFeed'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SEO, injectItemListSchema, injectBreadcrumbSchema } from '@/components/SEO'
import { useNews } from '@/hooks/useNews'
import { CATEGORIES, COMPANIES } from '@/lib/constants'
import type { Category } from '@/types/news'

// Valid categories for URL validation
const VALID_CATEGORIES = CATEGORIES.map(c => c.id)

export function TimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial state from URL
  const urlCategory = searchParams.get('category')
  const urlQuery = searchParams.get('q')
  const urlCompany = searchParams.get('company')

  // Redirect legacy ?category= URLs to new /category paths
  if (urlCategory && VALID_CATEGORIES.includes(urlCategory as Category)) {
    return <Navigate to={`/${urlCategory}`} replace />
  }

  // Validate company from URL
  const validCompanyIds = COMPANIES.map(c => c.id)
  const initialCompany = urlCompany && validCompanyIds.includes(urlCompany) ? urlCompany : null

  const [query, setQuery] = useState(urlQuery || '')
  const [company, setCompany] = useState<string | null>(initialCompany)
  const [currentDate, setCurrentDate] = useState(new Date())
  const timelineFeedRef = useRef<TimelineFeedRef>(null)

  // Sync state when URL changes (browser back/forward)
  useEffect(() => {
    const newQuery = searchParams.get('q')
    const newCompany = searchParams.get('company')

    const validCompany = newCompany && validCompanyIds.includes(newCompany) ? newCompany : null

    setQuery(newQuery || '')
    setCompany(validCompany)
  }, [searchParams, validCompanyIds])

  // Fetch real data from Supabase (falls back to mock if not configured)
  const { items, hasMore, loading, error, loadMore, refresh } = useNews({
    category: null,
    q: query || undefined,
    company,
  })

  const handleReset = useCallback(() => {
    setQuery('')
    // Clear URL params
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  // Handle date selection from dropdown
  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date)
    timelineFeedRef.current?.scrollToDate(date)
  }, [])

  // Handle visible date change from scroll
  const handleVisibleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // Company data for SEO
  const companyData = company ? COMPANIES.find(c => c.id === company) : null

  // Inject structured data for SEO
  useEffect(() => {
    // Breadcrumb schema
    const breadcrumbs = [
      { name: 'Home', url: 'https://updayapp.com' },
      { name: 'Timeline', url: 'https://updayapp.com/timeline' },
    ]
    if (companyData) {
      breadcrumbs.push({
        name: companyData.name,
        url: `https://updayapp.com/timeline?company=${company}`,
      })
    }
    injectBreadcrumbSchema(breadcrumbs)

    // ItemList schema for news feed
    if (items.length > 0) {
      injectItemListSchema(
        items.slice(0, 10).map((item, index) => ({
          title: item.title,
          url: item.sourceUrl,
          position: index + 1,
        }))
      )
    }
  }, [company, companyData, items])

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <SEO
          title={companyData ? `${companyData.name} News` : 'Timeline'}
          description={
            companyData
              ? `Latest news about ${companyData.name}. AI-summarized tech updates.`
              : 'Real-time tech news feed. AI-summarized, no noise.'
          }
          url={company ? `/timeline?company=${company}` : '/timeline'}
        />

        {/* Sidebar - visible on lg+ */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            showLogo={false}
            showMobileMenu={!company}
            pageTitle={company ? undefined : "All News"}
            pageDescription={company ? undefined : "All categories, real-time updates"}
            backLink={company ? { to: '/timeline/companies', label: 'Back to Companies' } : undefined}
          />
          {company ? (
            <CompanyFeedHeader
              companyId={company}
              articleCount={items.length}
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
            />
          ) : (
            <FilterBar
              currentCategory={null}
              disabled={!!query}
              currentDate={currentDate}
              onDateSelect={handleDateSelect}
            />
          )}
          <main id="main-content" className="flex-1">
            <TimelineFeed
              ref={timelineFeedRef}
              items={items}
              hasMore={hasMore}
              loading={loading}
              error={error}
              onLoadMore={loadMore}
              onRetry={refresh}
              searchQuery={query || undefined}
              category={null}
              companyName={companyData?.name}
              onReset={handleReset}
              onVisibleDateChange={handleVisibleDateChange}
            />
          </main>
        </div>
        <ScrollToTop />
      </div>
    </SidebarProvider>
  )
}
