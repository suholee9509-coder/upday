import { useLocation, Navigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
import { FilterBar, TimelineFeed } from '@/components/news'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SEO, CATEGORY_SEO, injectItemListSchema, injectBreadcrumbSchema, injectCollectionPageSchema } from '@/components/SEO'
import { useNews } from '@/hooks/useNews'
import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/types/news'

// Valid categories for URL validation
const VALID_CATEGORIES = CATEGORIES.map(c => c.id)

// Topic names for CollectionPage schema (used by Google for entity recognition)
const CATEGORY_TOPICS: Record<Category, string> = {
  ai: 'Artificial Intelligence',
  startups: 'Technology Startups',
  dev: 'Software Development',
  product: 'Product Design',
  research: 'Scientific Research',
}

// Extended SEO content for category landing pages
const CATEGORY_CONTENT: Record<Category, { h1: string; intro: string }> = {
  ai: {
    h1: 'AI News',
    intro: 'Latest artificial intelligence news including LLMs, machine learning, ChatGPT, Claude, and emerging AI trends. Updated in real-time.',
  },
  startups: {
    h1: 'Startup News',
    intro: 'Breaking startup news: funding rounds, acquisitions, IPOs, and founder stories from the global tech ecosystem.',
  },
  dev: {
    h1: 'Developer News',
    intro: 'Programming news, open source updates, GitHub releases, and developer tools. Stay current with the dev community.',
  },
  product: {
    h1: 'Product News',
    intro: 'Product launches, UI/UX trends, design tools, and product strategy insights from top tech companies.',
  },
  research: {
    h1: 'Research News',
    intro: 'Scientific discoveries, space exploration, biotech breakthroughs, and cutting-edge research papers.',
  },
}

export function CategoryPage() {
  const location = useLocation()

  // Extract category from pathname (e.g., /ai -> ai)
  const categoryParam = location.pathname.slice(1) // Remove leading slash

  // Validate category
  if (!categoryParam || !VALID_CATEGORIES.includes(categoryParam as Category)) {
    return <Navigate to="/timeline" replace />
  }

  const category = categoryParam as Category

  return <CategoryPageContent category={category} />
}

function CategoryPageContent({ category }: { category: Category }) {
  const [query, setQuery] = useState('')

  // Fetch real data from Supabase
  const { items, hasMore, loading, error, loadMore, refresh } = useNews({
    category,
    q: query || undefined,
  })

  const handleCategoryChange = useCallback((_newCategory: Category | null) => {
    // Navigation is handled by FilterBar links, this is just for compatibility
  }, [])

  const handleReset = useCallback(() => {
    setQuery('')
  }, [])

  // Dynamic SEO
  const seo = CATEGORY_SEO[category]
  const content = CATEGORY_CONTENT[category]
  const categoryInfo = CATEGORIES.find(c => c.id === category)

  // Inject structured data for SEO
  useEffect(() => {
    // Breadcrumb schema with clean URLs
    const breadcrumbs = [
      { name: 'Home', url: 'https://updayapp.com' },
      { name: content.h1, url: `https://updayapp.com/${category}` },
    ]
    injectBreadcrumbSchema(breadcrumbs)

    // CollectionPage schema for category pages (helps Google understand page type)
    injectCollectionPageSchema({
      name: content.h1,
      description: seo.description,
      url: `https://updayapp.com/${category}`,
      about: CATEGORY_TOPICS[category],
    })

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
  }, [category, items, content.h1, seo.description])

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <SEO
          title={seo.title}
          description={seo.description}
          url={`/${category}`}
        />

        {/* Sidebar - visible on lg+ */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            showLogo={false}
            showMobileMenu
            pageTitle={content.h1}
            pageDescription={categoryInfo?.coverage}
          />
          <FilterBar
            currentCategory={category}
            onCategoryChange={handleCategoryChange}
            disabled={!!query}
          />
          <main id="main-content" className="flex-1">
            {/* Hidden h1 for SEO */}
            <h1 className="sr-only">{content.h1}</h1>

            <TimelineFeed
              items={items}
              hasMore={hasMore}
              loading={loading}
              error={error}
              onLoadMore={loadMore}
              onRetry={refresh}
              searchQuery={query || undefined}
              category={category}
              onReset={handleReset}
            />
          </main>
        </div>
        <ScrollToTop />
      </div>
    </SidebarProvider>
  )
}
