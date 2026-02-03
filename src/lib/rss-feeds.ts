/**
 * RSS Feed Configuration
 * Shared configuration for news crawling across Workers and browser environments
 *
 * Source Diversity Principles:
 * - No single platform should exceed 30% of total coverage
 * - Include sources from different regions (US, EU, Global)
 * - Regular validation of feed health
 * - Graceful degradation for unavailable feeds
 */

import type { Category } from '@/types/news'

export interface RSSSource {
  url: string
  source: string
  categories: Category[]
  region?: 'us' | 'eu' | 'global' // Source region for diversity tracking
  priority?: number // 1-5, higher = more important
}

/**
 * RSS feed sources organized by category
 * Total: ~25 feeds across 6 categories with global diversity
 */
export const RSS_SOURCES: RSSSource[] = [
  // ============================================
  // AI - 5 sources (US, EU, Global perspectives)
  // ============================================
  {
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    source: 'TechCrunch',
    categories: ['ai'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    source: 'The Verge',
    categories: ['ai'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://venturebeat.com/category/ai/feed/',
    source: 'VentureBeat',
    categories: ['ai'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    source: 'MIT Technology Review',
    categories: ['ai'],
    region: 'us',
    priority: 5, // High credibility
  },
  {
    url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss',
    source: 'Wired',
    categories: ['ai'],
    region: 'us',
    priority: 4,
  },

  // ============================================
  // Startup - 4 sources
  // ============================================
  {
    url: 'https://techcrunch.com/category/startups/feed/',
    source: 'TechCrunch',
    categories: ['startup'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://news.crunchbase.com/feed/',
    source: 'Crunchbase News',
    categories: ['startup'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.theinformation.com/rss/all',
    source: 'The Information',
    categories: ['startup'],
    region: 'us',
    priority: 3, // May require auth
  },
  {
    url: 'https://restofworld.org/feed/latest/',
    source: 'Rest of World',
    categories: ['startup'],
    region: 'global',
    priority: 4, // Global tech perspective
  },

  // ============================================
  // Science - 4 sources
  // ============================================
  {
    url: 'https://feeds.arstechnica.com/arstechnica/science',
    source: 'Ars Technica',
    categories: ['science'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.sciencedaily.com/rss/all.xml',
    source: 'Science Daily',
    categories: ['science'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://phys.org/rss-feed/',
    source: 'Phys.org',
    categories: ['science'],
    region: 'global',
    priority: 4,
  },
  {
    url: 'https://www.technologyreview.com/feed/',
    source: 'MIT Technology Review',
    categories: ['science'],
    region: 'us',
    priority: 5,
  },

  // ============================================
  // Design - 4 sources
  // ============================================
  {
    url: 'https://feeds.feedburner.com/fastcompany/headlines',
    source: 'Fast Company',
    categories: ['design'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.dezeen.com/feed/',
    source: 'Dezeen',
    categories: ['design'],
    region: 'eu',
    priority: 5,
  },
  {
    url: 'https://www.designboom.com/feed/',
    source: 'Designboom',
    categories: ['design'],
    region: 'global',
    priority: 3,
  },
  {
    url: 'https://feeds.feedburner.com/core77/blog',
    source: 'Core77',
    categories: ['design'],
    region: 'us',
    priority: 3,
  },

  // ============================================
  // Space - 4 sources
  // ============================================
  {
    url: 'https://spacenews.com/feed/',
    source: 'SpaceNews',
    categories: ['space'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/space',
    source: 'Ars Technica',
    categories: ['space'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.nasa.gov/feed/',
    source: 'NASA',
    categories: ['space'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'http://www.space.com/feeds.xml',
    source: 'Space.com',
    categories: ['space'],
    region: 'us',
    priority: 4,
  },

  // ============================================
  // Dev - 6 sources
  // ============================================
  {
    url: 'https://dev.to/feed',
    source: 'Dev.to',
    categories: ['dev'],
    region: 'global',
    priority: 4,
  },
  {
    url: 'https://news.ycombinator.com/rss',
    source: 'Hacker News',
    categories: ['dev'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://blog.github.com/feed.xml',
    source: 'GitHub Blog',
    categories: ['dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://thenewstack.io/feed/',
    source: 'The New Stack',
    categories: ['dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://feed.infoq.com/',
    source: 'InfoQ',
    categories: ['dev'],
    region: 'global',
    priority: 4,
  },
  {
    url: 'https://www.theregister.com/headlines.atom',
    source: 'The Register',
    categories: ['dev'],
    region: 'eu',
    priority: 3,
  },

  // ============================================
  // General Tech (multi-category coverage)
  // ============================================
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    source: 'BBC Technology',
    categories: ['ai', 'dev', 'science'],
    region: 'eu',
    priority: 5, // High credibility global source
  },
  {
    url: 'https://www.engadget.com/rss.xml',
    source: 'Engadget',
    categories: ['ai', 'dev'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://www.zdnet.com/news/rss.xml',
    source: 'ZDNet',
    categories: ['dev', 'ai'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://www.wired.com/feed/rss',
    source: 'Wired',
    categories: ['ai', 'science', 'dev'],
    region: 'us',
    priority: 4,
  },
]

/**
 * Configuration constants
 */
export const FEED_CONFIG = {
  maxItemsPerFeed: 10, // Maximum articles per feed per crawl
  fetchTimeoutMs: 10000, // 10 seconds timeout per feed
  maxRetries: 3, // Retry count for failed fetches
  userAgent: 'upday-news-bot/1.0',
}

/**
 * Get sources by category
 */
export function getSourcesByCategory(category: Category): RSSSource[] {
  return RSS_SOURCES.filter(source => source.categories.includes(category))
}

/**
 * Get unique sources (deduplicated by URL)
 */
export function getUniqueSources(): RSSSource[] {
  const seen = new Set<string>()
  return RSS_SOURCES.filter(source => {
    if (seen.has(source.url)) return false
    seen.add(source.url)
    return true
  })
}

/**
 * Get source diversity stats
 */
export function getSourceDiversityStats(): {
  total: number
  byRegion: Record<string, number>
  bySource: Record<string, number>
} {
  const uniqueSources = getUniqueSources()
  const byRegion: Record<string, number> = {}
  const bySource: Record<string, number> = {}

  for (const source of uniqueSources) {
    const region = source.region || 'unknown'
    byRegion[region] = (byRegion[region] || 0) + 1
    bySource[source.source] = (bySource[source.source] || 0) + 1
  }

  return {
    total: uniqueSources.length,
    byRegion,
    bySource,
  }
}
