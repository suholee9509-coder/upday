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
 * Total: ~45 feeds across 5 categories with global diversity
 * Categories: ai, startups, dev, product, research
 */
export const RSS_SOURCES: RSSSource[] = [
  // ============================================
  // AI - 7 sources (US, EU, Global perspectives)
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
    url: 'https://www.wired.com/feed/tag/ai/latest/rss',
    source: 'Wired',
    categories: ['ai'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.engadget.com/rss.xml',
    source: 'Engadget',
    categories: ['ai'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://gizmodo.com/rss',
    source: 'Gizmodo',
    categories: ['ai'],
    region: 'us',
    priority: 3,
  },

  // ============================================
  // Startups - 5 sources
  // ============================================
  {
    url: 'https://techcrunch.com/category/startups/feed/',
    source: 'TechCrunch',
    categories: ['startups'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://news.crunchbase.com/feed/',
    source: 'Crunchbase News',
    categories: ['startups'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://restofworld.org/feed/latest/',
    source: 'Rest of World',
    categories: ['startups'],
    region: 'global',
    priority: 4, // Global tech perspective
  },
  {
    url: 'https://thenextweb.com/feed',
    source: 'The Next Web',
    categories: ['startups'],
    region: 'eu',
    priority: 4,
  },
  {
    url: 'https://mashable.com/feeds/rss/all',
    source: 'Mashable',
    categories: ['startups'],
    region: 'us',
    priority: 3,
  },

  // ============================================
  // Research - 5 sources (Science + Space combined)
  // ============================================
  {
    url: 'https://feeds.arstechnica.com/arstechnica/science',
    source: 'Ars Technica',
    categories: ['research'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.sciencedaily.com/rss/all.xml',
    source: 'Science Daily',
    categories: ['research'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://phys.org/rss-feed/',
    source: 'Phys.org',
    categories: ['research'],
    region: 'global',
    priority: 4,
  },
  {
    url: 'https://www.technologyreview.com/feed/',
    source: 'MIT Technology Review',
    categories: ['research'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://www.wired.com/feed/rss',
    source: 'Wired',
    categories: ['research'],
    region: 'us',
    priority: 4,
  },

  // ============================================
  // Product - 6 sources (formerly Design)
  // ============================================
  {
    url: 'https://feeds.feedburner.com/fastcompany/headlines',
    source: 'Fast Company',
    categories: ['product'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.dezeen.com/feed/',
    source: 'Dezeen',
    categories: ['product'],
    region: 'eu',
    priority: 5,
  },
  {
    url: 'https://www.designboom.com/feed/',
    source: 'Designboom',
    categories: ['product'],
    region: 'global',
    priority: 3,
  },
  {
    url: 'https://feeds.feedburner.com/core77/blog',
    source: 'Core77',
    categories: ['product'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://alistapart.com/main/feed/',
    source: 'A List Apart',
    categories: ['product'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://smashingmagazine.com/feed',
    source: 'Smashing Magazine',
    categories: ['product'],
    region: 'eu',
    priority: 4,
  },

  // ============================================
  // Research (Space) - 4 sources (merged into Research)
  // ============================================
  {
    url: 'https://spacenews.com/feed/',
    source: 'SpaceNews',
    categories: ['research'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/space',
    source: 'Ars Technica',
    categories: ['research'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.nasa.gov/feed/',
    source: 'NASA',
    categories: ['research'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://www.space.com/feeds/all',
    source: 'Space.com',
    categories: ['research'],
    region: 'us',
    priority: 4,
  },

  // ============================================
  // Dev - 10 sources
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
    url: 'https://github.blog/feed/',
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
  {
    url: 'https://css-tricks.com/feed/',
    source: 'CSS-Tricks',
    categories: ['dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.tomshardware.com/feeds/all',
    source: "Tom's Hardware",
    categories: ['dev'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://9to5mac.com/feed/',
    source: '9to5Mac',
    categories: ['dev'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://www.androidcentral.com/feed',
    source: 'Android Central',
    categories: ['dev'],
    region: 'us',
    priority: 3,
  },

  // ============================================
  // General Tech - Global authoritative sources (8 sources)
  // ============================================
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    source: 'BBC Technology',
    categories: ['ai', 'dev', 'research'],
    region: 'eu',
    priority: 5, // High credibility global source
  },
  {
    url: 'https://www.zdnet.com/news/rss.xml',
    source: 'ZDNet',
    categories: ['dev', 'ai'],
    region: 'us',
    priority: 3,
  },
  {
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    source: 'NY Times Tech',
    categories: ['ai', 'research'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://www.theguardian.com/technology/rss',
    source: 'The Guardian Tech',
    categories: ['ai', 'dev'],
    region: 'eu',
    priority: 5,
  },
  {
    url: 'https://www.cnet.com/rss/news/',
    source: 'CNET',
    categories: ['ai', 'dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://www.techradar.com/rss',
    source: 'TechRadar',
    categories: ['dev', 'ai'],
    region: 'eu',
    priority: 3,
  },
  {
    url: 'https://arstechnica.com/feed/',
    source: 'Ars Technica',
    categories: ['ai', 'dev', 'research'],
    region: 'us',
    priority: 4,
  },

  // ============================================
  // Company Official Blogs - Primary sources (12 sources)
  // ============================================
  {
    url: 'https://openai.com/blog/rss.xml',
    source: 'OpenAI Blog',
    categories: ['ai'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://www.anthropic.com/rss.xml',
    source: 'Anthropic Blog',
    categories: ['ai'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://blog.google/technology/ai/rss/',
    source: 'Google AI Blog',
    categories: ['ai'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://blogs.microsoft.com/feed/',
    source: 'Microsoft Blog',
    categories: ['ai'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://ai.meta.com/blog/rss/',
    source: 'Meta AI Blog',
    categories: ['ai'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://blogs.nvidia.com/feed/',
    source: 'NVIDIA Blog',
    categories: ['ai'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://mistral.ai/feed.xml',
    source: 'Mistral Blog',
    categories: ['ai'],
    region: 'eu',
    priority: 4,
  },
  {
    url: 'https://vercel.com/atom',
    source: 'Vercel Blog',
    categories: ['dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://supabase.com/blog/rss.xml',
    source: 'Supabase Blog',
    categories: ['dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://blog.cloudflare.com/rss/',
    source: 'Cloudflare Blog',
    categories: ['dev'],
    region: 'us',
    priority: 5,
  },
  {
    url: 'https://stripe.com/blog/feed.rss',
    source: 'Stripe Blog',
    categories: ['dev'],
    region: 'us',
    priority: 4,
  },
  {
    url: 'https://shopify.engineering/blog.atom',
    source: 'Shopify Engineering',
    categories: ['dev'],
    region: 'us',
    priority: 3,
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
