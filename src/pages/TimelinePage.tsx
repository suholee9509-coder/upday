import { useState, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { FilterBar, TimelineFeed } from '@/components/news'
import { getMockNews } from '@/lib/mock-data'
import type { Category } from '@/types/news'

export function TimelinePage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [query, setQuery] = useState('')

  // Get filtered news
  const { items, hasMore } = getMockNews({
    category: category || undefined,
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
          searchQuery={query || undefined}
          category={category}
          onReset={handleReset}
        />
      </main>
    </div>
  )
}
