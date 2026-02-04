import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Radio, Building2, Pin, ArrowRight, X, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPANIES } from '@/lib/constants'
import { usePinnedCompanies } from '@/hooks/usePinnedCompanies'
import { useSearchHistory } from '@/hooks/useSearchHistory'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

type ResultItem = {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  href: string
  section: 'pages' | 'pinned' | 'companies' | 'recommended'
}

// Recommended articles (curated picks)
const RECOMMENDED_ARTICLES = [
  { id: 'rec-1', title: 'AI & LLM News', query: 'AI' },
  { id: 'rec-2', title: 'Startup Funding', query: 'funding' },
  { id: 'rec-3', title: 'Developer Tools', query: 'developer' },
  { id: 'rec-4', title: 'Product Launches', query: 'launch' },
]

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { pinnedCompanies } = usePinnedCompanies()
  const { history, addSearchTerm, removeSearchTerm, clearHistory } = useSearchHistory()

  // Build searchable items
  const { defaultItems, allCompanies } = useMemo(() => {
    const pages: ResultItem[] = [
      {
        id: 'timeline',
        label: 'Live Feed',
        description: 'All news in real-time',
        icon: <Radio className="h-4 w-4" />,
        href: '/timeline',
        section: 'pages',
      },
      {
        id: 'companies',
        label: 'Browse Companies',
        description: 'Explore all tracked companies',
        icon: <Building2 className="h-4 w-4" />,
        href: '/timeline/companies',
        section: 'pages',
      },
    ]

    const pinned: ResultItem[] = pinnedCompanies
      .map(id => COMPANIES.find(c => c.id === id))
      .filter(Boolean)
      .map(company => ({
        id: `pinned-${company!.id}`,
        label: company!.name,
        icon: <Pin className="h-4 w-4 rotate-45" />,
        href: `/timeline?company=${company!.id}`,
        section: 'pinned' as const,
      }))

    const companies: ResultItem[] = COMPANIES.map(company => ({
      id: `company-${company.id}`,
      label: company.name,
      description: company.group.replace('-', ' '),
      icon: <Building2 className="h-4 w-4" />,
      href: `/timeline?company=${company.id}`,
      section: 'companies' as const,
    }))

    return {
      defaultItems: [...pages, ...pinned],
      allCompanies: companies,
    }
  }, [pinnedCompanies])

  // Filter items based on query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return defaultItems
    }

    const lowerQuery = query.toLowerCase()
    const allItems = [...defaultItems, ...allCompanies]
    return allItems.filter(
      item =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    )
  }, [defaultItems, allCompanies, query])

  // Group items by section
  const groupedItems = useMemo(() => {
    const groups: Record<string, ResultItem[]> = {
      pages: [],
      pinned: [],
      companies: [],
    }

    filteredItems.forEach(item => {
      groups[item.section].push(item)
    })

    return groups
  }, [filteredItems])

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  // Handle search with history
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      addSearchTerm(searchQuery)
      navigate(`/timeline?q=${encodeURIComponent(searchQuery)}`)
      onClose()
    }
  }, [addSearchTerm, navigate, onClose])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (query.trim() && filteredItems.length === 0) {
            // No results but has query - search for it
            handleSearch(query)
          } else if (filteredItems[selectedIndex]) {
            navigate(filteredItems[selectedIndex].href)
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [filteredItems, selectedIndex, navigate, onClose, query, handleSearch]
  )

  const handleItemClick = useCallback(
    (item: ResultItem) => {
      navigate(item.href)
      onClose()
    },
    [navigate, onClose]
  )

  const handleChipClick = useCallback((term: string) => {
    setQuery(term)
    inputRef.current?.focus()
  }, [])

  const handleRecommendedClick = useCallback((searchQuery: string) => {
    handleSearch(searchQuery)
  }, [handleSearch])

  if (!isOpen) return null

  const showRecentAndRecommended = !query.trim()
  let currentIndex = -1

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <div
          className="w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {/* Recent Searches - chips */}
            {showRecentAndRecommended && history.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Recent
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {history.slice(0, 6).map(item => (
                    <button
                      key={item.term}
                      onClick={() => handleChipClick(item.term)}
                      className="group inline-flex items-center gap-1 h-6 pl-2.5 pr-1.5 rounded-full text-xs bg-muted/60 text-foreground/80 hover:bg-muted transition-colors"
                    >
                      <span className="truncate max-w-[100px]">{item.term}</span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeSearchTerm(item.term)
                        }}
                        className="p-0.5 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted-foreground/20 transition-colors"
                        aria-label={`Remove ${item.term}`}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended - chips */}
            {showRecentAndRecommended && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Explore
                </div>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {RECOMMENDED_ARTICLES.map(rec => (
                    <button
                      key={rec.id}
                      onClick={() => handleRecommendedClick(rec.query)}
                      className="h-6 px-2.5 rounded-full text-[11px] text-muted-foreground border border-border/40 hover:border-border hover:text-foreground hover:bg-muted/30 transition-colors"
                    >
                      {rec.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {showRecentAndRecommended && (history.length > 0 || true) && filteredItems.length > 0 && (
              <div className="h-px bg-border/50 mx-2 my-2" />
            )}

            {filteredItems.length === 0 && query.trim() ? (
              <div className="py-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  No results for "{query}"
                </div>
                <button
                  onClick={() => handleSearch(query)}
                  className="text-xs text-primary hover:underline"
                >
                  Search "{query}" in articles →
                </button>
              </div>
            ) : (
              <>
                {/* Pages */}
                {groupedItems.pages.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Pages
                    </div>
                    {groupedItems.pages.map(item => {
                      currentIndex++
                      const index = currentIndex
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={selectedIndex === index}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Pinned */}
                {groupedItems.pinned.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Pinned
                    </div>
                    {groupedItems.pinned.map(item => {
                      currentIndex++
                      const index = currentIndex
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={selectedIndex === index}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        />
                      )
                    })}
                  </div>
                )}

                {/* Companies */}
                {groupedItems.companies.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Companies
                    </div>
                    {groupedItems.companies.map(item => {
                      currentIndex++
                      const index = currentIndex
                      return (
                        <CommandItem
                          key={item.id}
                          item={item}
                          isSelected={selectedIndex === index}
                          onClick={() => handleItemClick(item)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border border-border bg-background px-1 text-[10px]">↑</kbd>
              <kbd className="inline-flex h-5 items-center rounded border border-border bg-background px-1 text-[10px]">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border border-border bg-background px-1 text-[10px]">↵</kbd>
              <span className="ml-1">Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex h-5 items-center rounded border border-border bg-background px-1 text-[10px]">esc</kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function CommandItem({
  item,
  isSelected,
  onClick,
  onMouseEnter,
}: {
  item: ResultItem
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-accent text-accent-foreground'
          : 'text-foreground hover:bg-accent/50'
      )}
    >
      <span className={cn('shrink-0', isSelected ? 'text-accent-foreground' : 'text-muted-foreground')}>
        {item.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.label}</div>
        {item.description && (
          <div className="text-xs text-muted-foreground truncate">{item.description}</div>
        )}
      </div>
      {isSelected && <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </button>
  )
}

// Context for global command palette state
import { createContext, useContext, type ReactNode } from 'react'

interface CommandPaletteContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const value = {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  }

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </CommandPaletteContext.Provider>
  )
}

// Hook to access command palette from anywhere
export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}
