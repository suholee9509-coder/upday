/**
 * News Crawling Module
 * Fetches articles from RSS feeds and web sources
 */

import Parser from 'rss-parser'
import type { Category } from '@/types/news'

// Custom parser with media extensions
type CustomFeed = object
type CustomItem = {
  'media:content'?: { $?: { url?: string } }
  'media:thumbnail'?: { $?: { url?: string } }
  enclosure?: { url?: string }
  'content:encoded'?: string
}

const parser = new Parser<CustomFeed, CustomItem>({
  timeout: 10000,
  headers: {
    'User-Agent': 'upday-news-bot/1.0',
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

export interface RawArticle {
  title: string
  body: string
  sourceUrl: string
  source: string
  imageUrl?: string
  publishedAt: string
  suggestedCategories: Category[]
}

/**
 * Extract image URL from RSS item
 */
function extractImageUrl(item: CustomItem & Parser.Item): string | undefined {
  // 1. Check media:content
  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url
  }

  // 2. Check media:thumbnail
  if (item['media:thumbnail']?.$?.url) {
    return item['media:thumbnail'].$.url
  }

  // 3. Check enclosure (commonly used for images)
  if (item.enclosure?.url && item.enclosure.url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return item.enclosure.url
  }

  // 4. Try to extract from content HTML
  const content = item['content:encoded'] || item.content || ''
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch?.[1]) {
    return imgMatch[1]
  }

  return undefined
}

interface RSSSource {
  url: string
  source: string
  categories: Category[]
}

// RSS feed sources organized by category
const RSS_SOURCES: RSSSource[] = [
  // AI
  {
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    source: 'TechCrunch',
    categories: ['ai'],
  },
  {
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    source: 'The Verge',
    categories: ['ai'],
  },
  {
    url: 'https://venturebeat.com/category/ai/feed/',
    source: 'VentureBeat',
    categories: ['ai'],
  },

  // Startup
  {
    url: 'https://techcrunch.com/category/startups/feed/',
    source: 'TechCrunch',
    categories: ['startup'],
  },
  {
    url: 'https://www.theinformation.com/rss/all',
    source: 'The Information',
    categories: ['startup'],
  },

  // Science
  {
    url: 'https://feeds.arstechnica.com/arstechnica/science',
    source: 'Ars Technica',
    categories: ['science'],
  },
  {
    url: 'https://www.sciencedaily.com/rss/all.xml',
    source: 'Science Daily',
    categories: ['science'],
  },

  // Design
  {
    url: 'https://feeds.feedburner.com/fastcompany/headlines',
    source: 'Fast Company',
    categories: ['design'],
  },
  {
    url: 'https://www.dezeen.com/feed/',
    source: 'Dezeen',
    categories: ['design'],
  },

  // Space
  {
    url: 'https://spacenews.com/feed/',
    source: 'SpaceNews',
    categories: ['space'],
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/space',
    source: 'Ars Technica',
    categories: ['space'],
  },
  {
    url: 'https://www.nasa.gov/feed/',
    source: 'NASA',
    categories: ['space'],
  },

  // Dev
  {
    url: 'https://dev.to/feed',
    source: 'Dev.to',
    categories: ['dev'],
  },
  {
    url: 'https://news.ycombinator.com/rss',
    source: 'Hacker News',
    categories: ['dev'],
  },
  {
    url: 'https://blog.github.com/feed.xml',
    source: 'GitHub Blog',
    categories: ['dev'],
  },
]

/**
 * Crawl a single RSS source
 */
async function crawlSource(source: RSSSource): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(source.url)
    const articles: RawArticle[] = []

    for (const item of feed.items.slice(0, 10)) {
      // Latest 10 per source
      if (!item.title || !item.link) continue

      const body = item.contentSnippet || item.content || item.summary || ''
      const imageUrl = extractImageUrl(item as CustomItem & Parser.Item)

      articles.push({
        title: item.title,
        body: body,
        sourceUrl: item.link,
        source: source.source,
        imageUrl,
        publishedAt: item.pubDate
          ? new Date(item.pubDate).toISOString()
          : new Date().toISOString(),
        suggestedCategories: source.categories,
      })
    }

    return articles
  } catch (error) {
    console.error(`Failed to crawl ${source.source} (${source.url}):`, error)
    // Graceful degradation - return empty array instead of throwing
    return []
  }
}

/**
 * Crawl all configured RSS sources
 */
export async function crawlAllSources(): Promise<RawArticle[]> {
  const results = await Promise.allSettled(RSS_SOURCES.map(crawlSource))

  const articles: RawArticle[] = []
  let successCount = 0
  let failCount = 0

  for (const result of results) {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
      if (result.value.length > 0) successCount++
    } else {
      failCount++
    }
  }

  console.log(
    `Crawled ${articles.length} articles from ${successCount} sources (${failCount} failed)`
  )

  return articles
}

/**
 * Get the list of configured sources (for monitoring/debugging)
 */
export function getConfiguredSources(): RSSSource[] {
  return RSS_SOURCES
}
