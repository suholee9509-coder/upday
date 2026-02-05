import { Link } from 'react-router-dom'
import { Search, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, ThemeToggle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { MobileMenuButton } from './Sidebar'
import { useCommandPalette } from '@/components/CommandPalette'

interface HeaderProps {
  className?: string
  showLogo?: boolean
  showMobileMenu?: boolean
  pageTitle?: string
  pageDescription?: string
  backLink?: {
    to: string
    label: string
  }
}

export function Header({
  className,
  showLogo = true,
  showMobileMenu = false,
  pageTitle,
  pageDescription,
  backLink,
}: HeaderProps) {
  const { t } = useTranslation()
  const { open: openCommandPalette } = useCommandPalette()

  return (
    <header
      className={cn(
        'sticky top-0 z-20 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
        'border-b border-border',
        className
      )}
    >
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
        {/* Left section: Back Link / Mobile Menu + Page Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {backLink ? (
            <Link
              to={backLink.to}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLink.label}</span>
            </Link>
          ) : (
            <>
              {showMobileMenu && <MobileMenuButton />}
              {showLogo && (
                <Link to="/" className="font-bold text-xl text-foreground hover:opacity-80 transition-opacity shrink-0" aria-label={t('aria.updayHome')}>
                  upday
                </Link>
              )}
              {pageTitle && (
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm text-foreground shrink-0">{pageTitle}</span>
                  {pageDescription && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-sm text-muted-foreground truncate">{pageDescription}</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right section: Search + Theme */}
        <div className="flex items-center gap-2">
          {/* Search trigger - Desktop */}
          <button
            onClick={openCommandPalette}
            className="hidden md:flex items-center gap-2 h-9 w-56 px-3 rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={t('aria.searchCmdK')}
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-sm flex-1 text-left">{t('common.search')}</span>
            <kbd className="h-5 px-1.5 rounded border border-border bg-background text-[10px] font-medium shrink-0 inline-flex items-center justify-center gap-0.5"><span className="text-[11px]">⌘</span>K</kbd>
          </button>

          {/* Search trigger - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={openCommandPalette}
            aria-label={t('aria.openSearch')}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
