import { useState, useEffect, useRef } from 'react'
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
        <a href="/" className="font-bold text-xl text-foreground hover:opacity-80 transition-opacity">
          upday
        </a>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search news... (⌘K)"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {localQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search - Mobile (icon that expands) */}
        <div className="md:hidden">
          {isSearchOpen ? (
            <div className="fixed inset-0 z-50 bg-background p-4">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search news..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  autoFocus
                  className="flex-1"
                />
                <Button variant="ghost" onClick={() => setIsSearchOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
