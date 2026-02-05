import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage, type LanguageCode } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export function LanguageDropdown() {
  const { currentLanguage, languages, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const currentLangData = languages.find(l => l.code === currentLanguage)

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium',
          'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          'transition-colors duration-150',
          isOpen && 'bg-muted/50 text-foreground'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLangData?.nativeLabel}</span>
        <ChevronDown className={cn(
          'h-3.5 w-3.5 transition-transform duration-150',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-1 min-w-[140px]',
            'bg-card border border-border rounded-lg shadow-lg',
            'py-1 z-50',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          role="listbox"
          aria-label="Available languages"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code as LanguageCode)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm',
                'hover:bg-muted/50 transition-colors',
                currentLanguage === lang.code
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              )}
              role="option"
              aria-selected={currentLanguage === lang.code}
            >
              {currentLanguage === lang.code ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <span className="w-4" />
              )}
              <span>{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
