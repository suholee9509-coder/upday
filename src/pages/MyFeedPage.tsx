/**
 * My Feed Page - Personalized news feed with importance scoring
 *
 * DESIGN NOTES FOR DESIGNER:
 * This is a basic implementation showing:
 * 1. Weekly timeline bar for navigation
 * 2. News clusters (representative + related articles)
 * 3. Empty/loading states
 *
 * The designer should enhance:
 * - Overall page layout and spacing
 * - Cluster card design (show "+N related" indicator)
 * - Empty state illustrations and messaging
 * - Loading skeletons
 * - Animations and transitions
 */

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar, SidebarProvider } from '@/components/layout/Sidebar'
import { SEO } from '@/components/SEO'
import { NewsCard } from '@/components/news/NewsCard'
import { WeeklyBar } from '@/components/timeline/WeeklyBar'
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useMyFeed } from '@/hooks/useMyFeed'
import type { NewsCluster } from '@/lib/clustering'

/**
 * Cluster Card - Shows representative article + related count
 *
 * DESIGNER TODO:
 * - Add visual indicator for clustered articles (badge, icon)
 * - Design expand/collapse animation
 * - Style the "+N related" button
 * - Add separator between articles in expanded view
 */
function ClusterCard({ cluster }: { cluster: NewsCluster }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasRelated = cluster.related.length > 0

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Representative Article */}
      <NewsCard item={cluster.representative} />

      {/* Related Articles Toggle */}
      {hasRelated && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide {cluster.related.length} related{' '}
                {cluster.related.length === 1 ? 'article' : 'articles'}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show {cluster.related.length} related{' '}
                {cluster.related.length === 1 ? 'article' : 'articles'}
              </>
            )}
          </button>

          {/* Expanded Related Articles */}
          {isExpanded && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
              {cluster.related.map(relatedItem => (
                <NewsCard key={relatedItem.id} item={relatedItem} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * My Feed Page Component
 */
export function MyFeedPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { weeks, currentWeek, selectedWeekIndex, isLoading, error, selectWeek, hasInterests } =
    useMyFeed()

  // Redirect to timeline if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/timeline" replace />
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
          <div className="text-sm text-muted-foreground">Loading your feed...</div>
        </div>
      </div>
    )
  }

  // No interests set (should show onboarding)
  if (!hasInterests) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Set up your interests
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            To see your personalized feed, please complete the onboarding to set your interests.
          </p>
          <Button onClick={() => (window.location.href = '/settings')}>
            Go to Settings
          </Button>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Failed to load your feed
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO title="My Feed" description="Your personalized news feed based on your interests" />

      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="flex">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 md:ml-[240px]">
              {/* Weekly Timeline Bar */}
              <WeeklyBar
                weeks={weeks.map(week => ({
                  weekStart: week.weekStart,
                  weekEnd: week.weekEnd,
                  label: week.label,
                  totalItems: week.totalItems,
                }))}
                selectedWeekIndex={selectedWeekIndex}
                onSelectWeek={selectWeek}
              />

              {/* News Content */}
              <div className="max-w-3xl mx-auto">
                {currentWeek && currentWeek.clusters.length > 0 ? (
                  <div className="border-t border-border">
                    {currentWeek.clusters.map(cluster => (
                      <ClusterCard key={cluster.id} cluster={cluster} />
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex items-center justify-center py-16 px-4">
                    <div className="text-center max-w-md">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No important news this week
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We haven't found any significant news matching your interests for this
                        week. Try selecting a different week or adjusting your interests in
                        Settings.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  )
}

/**
 * DESIGN ENHANCEMENT CHECKLIST FOR DESIGNER:
 *
 * PAGE LAYOUT:
 * □ Optimize spacing and typography hierarchy
 * □ Add page header with title and description
 * □ Consider adding filters (sort by date/importance)
 * □ Design proper responsive layout for mobile
 *
 * WEEKLY BAR:
 * □ Enhance visual design (see WeeklyBar.tsx)
 * □ Add scroll indicators (fade effects on edges)
 * □ Implement smooth animations
 *
 * CLUSTER CARDS:
 * □ Add visual badge/indicator for clustered articles
 * □ Design better "+N related" button
 * □ Add expand/collapse animation
 * □ Style the related articles section distinctly
 *
 * EMPTY STATES:
 * □ Add illustrations or icons
 * □ Improve messaging and CTAs
 * □ Consider different empty states (no interests, no news, etc.)
 *
 * LOADING STATES:
 * □ Design skeleton loaders for news cards
 * □ Add loading animation for weekly bar
 * □ Show partial content while loading more
 *
 * INTERACTIONS:
 * □ Add subtle hover effects
 * □ Implement smooth scroll behavior
 * □ Add keyboard shortcuts
 * □ Consider infinite scroll vs pagination
 *
 * ACCESSIBILITY:
 * □ Ensure proper ARIA labels
 * □ Test keyboard navigation
 * □ Verify color contrast
 * □ Add focus indicators
 */
