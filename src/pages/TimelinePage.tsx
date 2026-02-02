import { useState, useCallback, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { FilterBar, TimelineFeed } from '@/components/news'
import { SEO, CATEGORY_SEO, injectItemListSchema, injectBreadcrumbSchema } from '@/components/SEO'
import { useNews } from '@/hooks/useNews'
import type { Category } from '@/types/news'

export function TimelinePage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [query, setQuery] = useState('')

  // Fetch real data from Supabase (falls back to mock if not configured)
  const { items, hasMore, loading, error, loadMore, refresh } = useNews({
    category,
    q: query || undefined,
  })

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    // Clear category when searching
    if (newQuery) {
      setCategory(null)
    }
  }, [])

  const handleCategoryChange = useCallback((newCategory: Category | null) => {
    setCategory(newCategory)
    // Clear search when filtering
    setQuery('')
  }, [])

  const handleReset = useCallback(() => {
    setQuery('')
    setCategory(null)
  }, [])

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
        title={seo?.title || 'Timeline'}
        description={seo?.description || 'Real-time tech news feed. AI-summarized, no noise.'}
        url={category ? `/${category}` : '/timeline'}
      />
      <Header query={query} onQueryChange={handleQueryChange} />
      <FilterBar
        currentCategory={category}
        onCategoryChange={handleCategoryChange}
        disabled={!!query}
      />
      <main>
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
  )
}
