import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input, Button, ThemeToggle } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface HeaderProps {
  query: string
  onQueryChange: (query: string) => void
  className?: string
}

export function Header({ query, onQueryChange, className }: HeaderProps) {
  const [localQuery, setLocalQuery] = useState(query)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchTriggerRef = useRef<HTMLButtonElement>(null)
  const debouncedQuery = useDebounce(localQuery, 300)

  // Sync debounced query to parent
  useEffect(() => {
    onQueryChange(debouncedQuery)
  }, [debouncedQuery, onQueryChange])

  // Sync from parent (e.g., URL changes)
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  // ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const clearSearch = () => {
    setLocalQuery('')
    onQueryChange('')
    setIsSearchOpen(false)
  }

  // Focus management for mobile search overlay
  const closeMobileSearch = () => {
    setIsSearchOpen(false)
    // Return focus to trigger button
    setTimeout(() => mobileSearchTriggerRef.current?.focus(), 0)
  }

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 0)
    }
  }, [isSearchOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-20 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'border-b border-border',
        className
      )}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-foreground hover:opacity-80 transition-opacity" aria-label="Upday home">
          upday
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative" role="search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search news... (⌘K)"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="pl-10 pr-10"
            aria-label="Search news"
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Search - Mobile (icon that expands) */}
        <div className="md:hidden">
          {isSearchOpen ? (
            <div
              className="fixed inset-0 z-50 bg-background p-4"
              role="dialog"
              aria-label="Search"
              aria-modal="true"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault()
                  closeMobileSearch()
                }
              }}
            >
              <div className="flex items-center gap-2" role="search">
                <Input
                  ref={mobileInputRef}
                  type="search"
                  placeholder="Search news..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="flex-1"
                  aria-label="Search news"
                />
                <Button variant="ghost" onClick={closeMobileSearch}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              ref={mobileSearchTriggerRef}
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
          )}
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
