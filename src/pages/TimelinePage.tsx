import { useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { FilterBar, TimelineFeed } from '@/components/news'
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

  return (
    <div className="min-h-screen bg-background">
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
