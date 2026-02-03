import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { FilterBar, TimelineFeed } from '@/components/news'
import { ScrollToTop } from '@/components/ScrollToTop'
import { SEO, CATEGORY_SEO, injectItemListSchema, injectBreadcrumbSchema } from '@/components/SEO'
import { useNews } from '@/hooks/useNews'
import type { Category } from '@/types/news'

// Valid categories for URL validation
const VALID_CATEGORIES = ['ai', 'startup', 'science', 'design', 'space', 'dev'] as const

export function TimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial state from URL
  const urlCategory = searchParams.get('category')
  const urlQuery = searchParams.get('q')

  // Validate category from URL
  const initialCategory = urlCategory && VALID_CATEGORIES.includes(urlCategory as Category)
    ? (urlCategory as Category)
    : null

  const [category, setCategory] = useState<Category | null>(initialCategory)
  const [query, setQuery] = useState(urlQuery || '')

  // Sync state when URL changes (browser back/forward)
  useEffect(() => {
    const newCategory = searchParams.get('category')
    const newQuery = searchParams.get('q')

    const validCategory = newCategory && VALID_CATEGORIES.includes(newCategory as Category)
      ? (newCategory as Category)
      : null

    setCategory(validCategory)
    setQuery(newQuery || '')
  }, [searchParams])

  // Fetch real data from Supabase (falls back to mock if not configured)
  const { items, hasMore, loading, error, loadMore, refresh } = useNews({
    category,
    q: query || undefined,
  })

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    // Update URL params
    setSearchParams(prev => {
      if (newQuery) {
        prev.set('q', newQuery)
        prev.delete('category') // Clear category when searching
      } else {
        prev.delete('q')
      }
      return prev
    }, { replace: true })
    // Clear category when searching
    if (newQuery) {
      setCategory(null)
    }
  }, [setSearchParams])

  const handleCategoryChange = useCallback((newCategory: Category | null) => {
    setCategory(newCategory)
    // Update URL params
    setSearchParams(prev => {
      if (newCategory) {
        prev.set('category', newCategory)
      } else {
        prev.delete('category')
      }
      prev.delete('q') // Clear search when filtering
      return prev
    }, { replace: true })
    // Clear search when filtering
    setQuery('')
  }, [setSearchParams])

  const handleReset = useCallback(() => {
    setQuery('')
    setCategory(null)
    // Clear URL params
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  // Dynamic SEO based on category
  const seo = category ? CATEGORY_SEO[category] : null

  // Inject structured data for SEO
  useEffect(() => {
    // Breadcrumb schema
    const breadcrumbs = [
      { name: 'Home', url: 'https://updayapp.com' },
      { name: 'Timeline', url: 'https://updayapp.com/timeline' },
    ]
    if (category) {
      breadcrumbs.push({
        name: category.toUpperCase(),
        url: `https://updayapp.com/timeline?category=${category}`,
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
  }, [category, items])

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Timeline"
        description={seo?.description || 'Real-time tech news feed. AI-summarized, no noise.'}
        url={category ? `/${category}` : '/timeline'}
      />
      <Header query={query} onQueryChange={handleQueryChange} />
      <FilterBar
        currentCategory={category}
        onCategoryChange={handleCategoryChange}
        disabled={!!query}
      />
      <main id="main-content">
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
      <ScrollToTop />
    </div>
  )
}
