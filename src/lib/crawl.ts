/**
 * News Crawling Module
 * Fetches articles from RSS feeds and web sources
 */

import Parser from 'rss-parser'
import type { Category } from '@/types/news'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'upday-news-bot/1.0',
  },
})

export interface RawArticle {
  title: string
  body: string
  sourceUrl: string
  source: string
  publishedAt: string
  suggestedCategories: Category[]
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

      articles.push({
        title: item.title,
        body: body,
        sourceUrl: item.link,
        source: source.source,
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
