import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '@/components/SEO'

/**
 * Redirect page for tracking outbound clicks
 * Usage: /go?url=https://example.com/article
 *
 * Flow:
 * 1. User clicks link on social media
 * 2. Lands on this page (traffic recorded in analytics)
 * 3. Immediately redirects to original article
 */
export function RedirectPage() {
  const [searchParams] = useSearchParams()
  const targetUrl = searchParams.get('url')

  useEffect(() => {
    if (targetUrl) {
      // Validate URL to prevent open redirect vulnerability
      try {
        const url = new URL(targetUrl)
        // Only allow http/https protocols
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          // Small delay to ensure page view is registered
          setTimeout(() => {
            window.location.replace(targetUrl)
          }, 100)
        } else {
          window.location.replace('/')
        }
      } catch {
        // Invalid URL, redirect to home
        window.location.replace('/')
      }
    } else {
      // No URL provided, redirect to home
      window.location.replace('/')
    }
  }, [targetUrl])

  return (
    <>
      <SEO title="Redirecting" noindex />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </>
  )
}
