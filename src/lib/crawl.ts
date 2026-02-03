/**
 * News Crawling Module
 * Fetches articles from RSS feeds and web sources
 *
 * Uses shared RSS configuration from rss-feeds.ts for source diversity
 */

import Parser from 'rss-parser'
import type { Category } from '@/types/news'
import { RSS_SOURCES, FEED_CONFIG, type RSSSource } from './rss-feeds'

// Custom parser with media extensions
type CustomFeed = object
type CustomItem = {
  'media:content'?: { $?: { url?: string } }
  'media:thumbnail'?: { $?: { url?: string } }
  enclosure?: { url?: string }
  'content:encoded'?: string
}

const parser = new Parser<CustomFeed, CustomItem>({
  timeout: FEED_CONFIG.fetchTimeoutMs,
  headers: {
    'User-Agent': FEED_CONFIG.userAgent,
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
  sourceUrl: string  // IMPORTANT: Must be the actual article URL, not category/homepage
  source: string
  imageUrl?: string
  publishedAt: string
  suggestedCategories: Category[]
}

/**
 * Validate that a URL is a valid article URL (not a homepage or category page)
 */
function isValidArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Must have a path beyond just "/"
    if (parsed.pathname === '/' || parsed.pathname === '') {
      return false
    }
    // Should not be a category/tag page (heuristic check)
    const lowerPath = parsed.pathname.toLowerCase()
    if (lowerPath.match(/^\/(category|tag|topic|section|feed|rss)\/?$/)) {
      return false
    }
    return true
  } catch {
    return false
  }
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

// RSSSource type is imported from rss-feeds.ts
// RSS_SOURCES is imported from rss-feeds.ts for shared configuration

/**
 * Crawl a single RSS source
 */
async function crawlSource(source: RSSSource): Promise<RawArticle[]> {
  try {
    const feed = await parser.parseURL(source.url)
    const articles: RawArticle[] = []

    for (const item of feed.items.slice(0, FEED_CONFIG.maxItemsPerFeed)) {
      if (!item.title || !item.link) continue

      // CRITICAL: Validate that link is an actual article URL
      if (!isValidArticleUrl(item.link)) {
        console.warn(`Skipping invalid article URL: ${item.link}`)
        continue
      }

      const body = item.contentSnippet || item.content || item.summary || ''
      const imageUrl = extractImageUrl(item as CustomItem & Parser.Item)

      articles.push({
        title: item.title,
        body: body,
        sourceUrl: item.link,  // This MUST be the direct article URL from RSS
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
