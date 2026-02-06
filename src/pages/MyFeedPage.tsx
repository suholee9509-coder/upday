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

import { useState, useEffect, useRef, useMemo, memo } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { AlertCircle, ChevronDown, ChevronUp, Inbox, Settings, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Sidebar, SidebarProvider, useSidebar } from '@/components/layout/Sidebar'
import { SEO } from '@/components/SEO'
import { NewsCard } from '@/components/news/NewsCard'
import { TimelineNavigator } from '@/components/timeline/TimelineNavigator'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { useMyFeed } from '@/hooks/useMyFeed'
import { useUserInterests } from '@/hooks/useUserInterests'
import { useRealtimeTranslation } from '@/hooks/useRealtimeTranslation'
import type { NewsCluster } from '@/lib/clustering'
import type { WeekData } from '@/hooks/useMyFeed'

// DEMO MODE: Set to true to use dummy data for layout testing
const DEMO_MODE = false

/**
 * Generate dummy data for demo/testing purposes
 */
function generateDummyWeeks(): WeekData[] {
  const now = new Date()
  const weeks: WeekData[] = []

  const categories = ['ai', 'startups', 'dev', 'product', 'research']
  const sources = ['TechCrunch', 'Bloomberg', 'The Verge', 'Reuters', 'Wired']

  const sampleTitles = [
    'React 19 introduces major AI-powered features',
    'TypeScript 5.5 brings better type inference',
    'New Design system revolutionizes Web3 interfaces',
    'AI safety concerns raised by researchers',
    'React Native updates transform mobile development',
    'Web3 adoption accelerates in enterprise',
    'Design trends: AI-generated UI components',
    'TypeScript dominates JavaScript ecosystem',
    'React Server Components change web development',
    'AI and Web3 converge in new Design frameworks',
  ]

  const sampleSummaries = [
    'Industry experts weigh in on the implications for future development and deployment.',
    'Regulators push for stricter oversight amid growing concerns about market dominance.',
    'Scientists achieve significant progress in practical quantum computing applications.',
    'Recent findings suggest more aggressive action needed to meet climate goals.',
    'Deal valued at billions is expected to reshape competitive landscape.',
  ]

  for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekOffset * 7)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Generate week label
    const startMonth = weekStart.getMonth() + 1
    const startDay = weekStart.getDate()
    const endMonth = weekEnd.getMonth() + 1
    const endDay = weekEnd.getDate()
    const label = startMonth === endMonth
      ? `${startMonth}/${startDay}-${endDay}`
      : `${startMonth}/${startDay}-${endMonth}/${endDay}`

    // Generate 3-7 clusters per week
    const clusterCount = Math.floor(Math.random() * 5) + 3
    const clusters: NewsCluster[] = []

    for (let i = 0; i < clusterCount; i++) {
      const publishedDate = new Date(weekStart.getTime() + Math.random() * (weekEnd.getTime() - weekStart.getTime()))
      const category = categories[Math.floor(Math.random() * categories.length)]
      const source = sources[Math.floor(Math.random() * sources.length)]

      const representative: any = {
        id: `demo-${weekOffset}-${i}-rep`,
        title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
        summary: sampleSummaries[Math.floor(Math.random() * sampleSummaries.length)],
        category: category as any,
        publishedAt: publishedDate.toISOString(),
        source,
        sourceUrl: '#',
        imageUrl: Math.random() > 0.5 ? `https://picsum.photos/seed/${weekOffset}-${i}/400/300` : undefined,
        body: '',
        createdAt: publishedDate.toISOString(),
      }

      // 30% chance of having related articles
      const hasRelated = Math.random() > 0.7
      const relatedCount = hasRelated ? Math.floor(Math.random() * 3) + 1 : 0
      const related: any[] = Array.from({ length: relatedCount }, (_, j) => ({
        id: `demo-${weekOffset}-${i}-rel-${j}`,
        title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
        summary: sampleSummaries[Math.floor(Math.random() * sampleSummaries.length)],
        category: category as any,
        publishedAt: new Date(publishedDate.getTime() + j * 3600000).toISOString(),
        source: sources[Math.floor(Math.random() * sources.length)],
        sourceUrl: '#',
        imageUrl: Math.random() > 0.6 ? `https://picsum.photos/seed/${weekOffset}-${i}-${j}/400/300` : undefined,
        body: '',
        createdAt: new Date(publishedDate.getTime() + j * 3600000).toISOString(),
      }))

      clusters.push({
        id: `cluster-${weekOffset}-${i}`,
        representative,
        related,
        clusterSize: 1 + related.length,
      })
    }

    weeks.push({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      label,
      clusters,
      totalItems: clusters.reduce((sum, c) => sum + c.clusterSize, 0),
    })
  }

  return weeks
}

/**
 * Cluster Card - Shows representative article + related articles
 * Enhanced design with badge, visual hierarchy, and clear separation
 */
const ClusterCard = memo(function ClusterCard({ cluster, userKeywords, language }: { cluster: NewsCluster; userKeywords: string[]; language: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasRelated = cluster.related.length > 0

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Representative Article */}
      <NewsCard item={cluster.representative} userKeywords={userKeywords} language={language} className="border-b-0" />

      {/* Related Articles Toggle - Subtle design */}
      {hasRelated && (
        <div className="pb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center justify-center gap-1.5 w-full',
              'py-2',
              'text-xs',
              'text-muted-foreground/70 hover:text-muted-foreground',
              'transition-colors'
            )}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span>Hide {cluster.related.length} related</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>+{cluster.related.length} related</span>
              </>
            )}
          </button>

          {/* Expanded Related Articles */}
          {isExpanded && (
            <div className="mt-2 border-l-2 border-primary/20 ml-6">
              {cluster.related.map((relatedItem, index) => (
                <div
                  key={relatedItem.id}
                  className={cn(
                    index > 0 && 'border-t border-border/50'
                  )}
                >
                  <NewsCard
                    item={relatedItem}
                    userKeywords={userKeywords}
                    language={language}
                    className="opacity-90 hover:opacity-100 border-b-0"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

/**
 * Weekly Insights Bar - Shows feed statistics (desktop only)
 */
interface WeeklyInsightsBarProps {
  totalArticles: number
  totalWeeks?: number
  dateRange?: { start: string; end: string } | null
}

const WeeklyInsightsBar = memo(function WeeklyInsightsBar({ totalArticles }: WeeklyInsightsBarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        'fixed top-[61px] left-0 z-10',
        'right-0 md:right-[240px]',
        'hidden md:block', // Desktop only
        'transition-[padding] duration-200 ease-in-out',
        isCollapsed ? 'md:pl-[60px]' : 'md:pl-[240px]'
      )}
    >
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-6 py-3">
          {/* Articles count */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold text-foreground">{totalArticles}</span>
              <span className="text-xs text-muted-foreground">articles curated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

/**
 * Mobile Timeline Bar - Horizontal scrollable week list (mobile only)
 * Matches desktop timeline visual style with dots and clean typography
 */
interface MobileTimelineProps {
  weeks: { weekStart: string; label: string; totalItems: number }[]
  activeWeekIndex: number
  onWeekClick: (index: number) => void
}

const MobileTimeline = memo(function MobileTimeline({ weeks, activeWeekIndex, onWeekClick }: MobileTimelineProps) {
  return (
    <nav
      className={cn(
        'md:hidden fixed top-14 left-0 right-0 z-20',
        'bg-muted/70 backdrop-blur-md',
        'border-b border-border'
      )}
      aria-label="Timeline navigation"
    >
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
        {weeks.map((week, index) => {
          const isActive = index === activeWeekIndex
          const isCurrent = index === 0

          return (
            <button
              key={week.weekStart}
              onClick={() => onWeekClick(index)}
              className={cn(
                'group flex-shrink-0 flex flex-col items-center px-3 py-1.5',
                'transition-colors duration-200',
                'rounded-lg',
                isActive ? 'bg-background/60' : 'hover:bg-background/30'
              )}
              aria-label={`Jump to week of ${week.label}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Week info */}
              <div className="flex items-center gap-1">
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                <span className={cn(
                  'text-xs font-semibold whitespace-nowrap',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {week.label}
                </span>
              </div>

              {/* Article count */}
              <span className={cn(
                'text-[10px] whitespace-nowrap',
                isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'
              )}>
                {week.totalItems}개
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
})

/**
 * My Feed Page Component
 */
export function MyFeedPage() {
  const { currentLanguage: language } = useLanguage()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const myFeedResult = useMyFeed()
  const { interests } = useUserInterests()
  const { translateAll } = useRealtimeTranslation()
  const [, setTranslationTrigger] = useState(0) // Trigger re-render after translation

  // DEMO MODE: Override with dummy data if enabled
  const dummyWeeks = useMemo(() => DEMO_MODE ? generateDummyWeeks() : [], [])
  const weeks = DEMO_MODE ? dummyWeeks : myFeedResult.weeks
  const isLoading = DEMO_MODE ? false : myFeedResult.isLoading
  const error = DEMO_MODE ? null : myFeedResult.error
  const hasInterests = DEMO_MODE ? true : myFeedResult.hasInterests

  const [activeWeekIndex, setActiveWeekIndex] = useState(0)
  const weekRefs = useRef<(HTMLElement | null)[]>([])
  const mainRef = useRef<HTMLElement | null>(null)

  // Get user keywords for NewsCard display
  const userKeywords = useMemo(() => {
    if (DEMO_MODE) return ['React', 'AI', 'Design', 'TypeScript', 'Web3']
    return interests?.keywords || []
  }, [interests])

  // Calculate feed statistics
  const feedStats = useMemo(() => {
    const totalArticles = weeks.reduce((sum, week) => sum + week.totalItems, 0)
    const dateRange =
      weeks.length > 0
        ? {
            start: weeks[weeks.length - 1]?.label || '',
            end: weeks[0]?.label || '',
          }
        : null
    return { totalArticles, totalWeeks: weeks.length, dateRange }
  }, [weeks])

  // Memoize weeks data for MobileTimeline to prevent unnecessary re-renders
  const mobileTimelineWeeks = useMemo(() =>
    weeks.map(w => ({ weekStart: w.weekStart, label: w.label, totalItems: w.totalItems })),
    [weeks]
  )

  // Translate all articles when in Korean mode
  // Triggers on: language switch to Korean, page load with Korean, new articles loaded
  useEffect(() => {
    if (language === 'ko' && weeks.length > 0) {
      // Collect all articles from all weeks
      const allArticles = weeks.flatMap(week =>
        week.clusters.flatMap(cluster => [
          cluster.representative,
          ...cluster.related
        ])
      )

      // Translate all at once (translateAll skips already-cached items)
      translateAll(allArticles).then(() => {
        setTranslationTrigger(prev => prev + 1)
      })
    }
  }, [language, weeks, translateAll])

  // Track which week section is in view based on scroll position
  useEffect(() => {
    const scrollContainer = mainRef.current
    if (!scrollContainer || weeks.length === 0) return

    const handleScroll = () => {
      const containerRect = scrollContainer.getBoundingClientRect()
      // Trigger point: slightly below the top of the scroll container
      const triggerY = containerRect.top + 100

      let activeIndex = 0
      for (let i = 0; i < weekRefs.current.length; i++) {
        const ref = weekRefs.current[i]
        if (!ref) continue
        const rect = ref.getBoundingClientRect()
        // If section top has scrolled past the trigger point, this or a later section is active
        if (rect.top <= triggerY) {
          activeIndex = i
        }
      }

      setActiveWeekIndex(activeIndex)
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    // Run once on mount to set initial state
    handleScroll()

    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [weeks.length, isLoading])

  // Scroll to specific week
  const handleWeekClick = (index: number) => {
    // Update active week index immediately
    setActiveWeekIndex(index)
    // Scroll to the week section
    weekRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  // Redirect to timeline if not authenticated (skip in demo mode)
  if (!DEMO_MODE && !authLoading && !isAuthenticated) {
    return <Navigate to="/timeline" replace />
  }

  // Loading state (skip in demo mode)
  if (!DEMO_MODE && (authLoading || isLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-primary" />
          <div className="text-sm text-muted-foreground">Loading your feed...</div>
        </div>
      </div>
    )
  }

  // No interests set (should show onboarding) - skip in demo mode
  if (!DEMO_MODE && !hasInterests) {
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
      <SEO title="My Feed" description="Your personalized news feed based on your interests" noindex />

      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          {/* Sidebar - visible on lg+ */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 h-screen">
            <Header
              showLogo={false}
              showMobileMenu={true}
              pageTitle="My Feed"
              pageDescription="Personalized news based on your interests"
            />

            {/* Timeline Navigator */}
            <TimelineNavigator
              weeks={weeks.map(week => ({
                weekStart: week.weekStart,
                weekEnd: week.weekEnd,
                label: week.label,
                totalItems: week.totalItems,
              }))}
              activeWeekIndex={activeWeekIndex}
              onWeekClick={handleWeekClick}
            />

            {/* Weekly Insights Bar - Fixed below header */}
            {weeks.length > 0 && (
              <WeeklyInsightsBar
                totalArticles={feedStats.totalArticles}
                totalWeeks={feedStats.totalWeeks}
                dateRange={feedStats.dateRange}
              />
            )}

            {/* Mobile Timeline - Fixed below header */}
            {weeks.length > 0 && (
              <MobileTimeline
                weeks={mobileTimelineWeeks}
                activeWeekIndex={activeWeekIndex}
                onWeekClick={handleWeekClick}
              />
            )}

            {/* News Content */}
            <main ref={mainRef} id="main-content" className={cn(
              'md:mt-[52px] md:mr-[240px] overflow-y-auto scrollbar-subtle',
              weeks.length > 0
                ? 'mt-[48px] h-[calc(100vh-108px)]'  // Mobile: header(60) + timeline(48) = 108px total fixed
                : 'mt-0 h-[calc(100vh-60px)]',       // Mobile: header only
              'md:h-[calc(100vh-112px)]',            // Desktop: override mobile height
            )}>
              <div className="max-w-3xl mx-auto">
                {weeks.length > 0 ? (
                  <div>
                    {weeks.map((week, weekIndex) => (
                      <section
                        key={week.weekStart}
                        ref={(el) => { weekRefs.current[weekIndex] = el }}
                        className="scroll-mt-4 md:scroll-mt-0"
                      >
                        {/* Week Header - Desktop only (mobile has timeline bar) */}
                        <div className={cn(
                          'hidden md:block',
                          'sticky top-0 z-[9]',
                          'bg-muted/20 backdrop-blur-sm',
                          'border-y border-border',
                          'px-6 py-3.5',
                          'mt-8 first:mt-0'
                        )}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">
                              {week.label}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              {week.totalItems} {week.totalItems === 1 ? 'article' : 'articles'}
                            </span>
                          </div>
                        </div>

                        {/* Week Content */}
                        {week.clusters.length > 0 ? (
                          <div>
                            {week.clusters.map(cluster => (
                              <ClusterCard key={`${cluster.id}-${language}`} cluster={cluster} userKeywords={userKeywords} language={language} />
                            ))}
                          </div>
                        ) : (
                          <div className="hidden md:block py-12 px-6 text-center">
                            <p className="text-sm text-muted-foreground">
                              No news this week
                            </p>
                          </div>
                        )}
                      </section>
                    ))}
                  </div>
                ) : (
                  /* Empty State - No News At All */
                  <div className="flex items-center justify-center py-20 px-4">
                    <div className="text-center max-w-md">
                      <div className="mb-6 flex justify-center">
                        <div className="relative">
                          <Inbox className="h-16 w-16 text-muted-foreground/30" strokeWidth={1.5} />
                          <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-bold text-muted-foreground">0</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No important news yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        We haven't found any significant news matching your interests.
                        Try adjusting your interests in settings.
                      </p>
                      <Link to="/settings">
                        <Button variant="primary" className="gap-2">
                          <Settings className="h-4 w-4" />
                          Adjust Interests
                        </Button>
                      </Link>
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
