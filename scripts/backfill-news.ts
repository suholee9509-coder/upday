#!/usr/bin/env npx tsx
/**
 * Backfill Historical News Script
 *
 * Fetches historical news articles from various sources to populate past weeks.
 * Uses pagination/archive endpoints where available.
 *
 * Usage: npx tsx scripts/backfill-news.ts
 *
 * Options:
 *   --dry-run    Preview without inserting to DB
 *   --weeks=N    Number of weeks to backfill (default: 12)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import Parser from 'rss-parser'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

type CustomItem = {
  'media:content'?: { $?: { url?: string } }
  'media:thumbnail'?: { $?: { url?: string } }
  enclosure?: { url?: string }
  'content:encoded'?: string
}

const parser = new Parser<object, CustomItem>({
  timeout: 30000,
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

// Company patterns for extraction
const COMPANY_PATTERNS: Record<string, RegExp> = {
  'openai': /\bopen\s?ai\b/i,
  'anthropic': /\banthropic\b/i,
  'google': /\bgoogle\b/i,
  'microsoft': /\bmicrosoft\b/i,
  'meta': /\bmeta\b(?!\s*data)/i,
  'nvidia': /\bnvidia\b/i,
  'xai': /\bx\.?ai\b/i,
  'mistral': /\bmistral\b/i,
  'vercel': /\bvercel\b/i,
  'supabase': /\bsupabase\b/i,
  'cloudflare': /\bcloudflare\b/i,
  'apple': /\bapple\b(?!\s*(?:pie|cider|tree))/i,
  'amazon': /\bamazon\b/i,
  'tesla': /\btesla\b/i,
}

function extractCompanies(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  const companies: string[] = []
  for (const [slug, pattern] of Object.entries(COMPANY_PATTERNS)) {
    if (pattern.test(text)) {
      companies.push(slug)
    }
  }
  return companies
}

function extractImageUrl(item: CustomItem & Parser.Item): string | undefined {
  if (item['media:content']?.$?.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url
  if (item.enclosure?.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)) return item.enclosure.url
  const content = item['content:encoded'] || item.content || ''
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch?.[1]) return imgMatch[1]
  return undefined
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function generateSummary(body: string): string {
  const clean = stripHtml(body)
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 20)
  if (sentences.length === 0) return clean.slice(0, 200)
  let summary = ''
  for (const sentence of sentences.slice(0, 3)) {
    const trimmed = sentence.trim()
    if (summary.length + trimmed.length > 300) break
    summary += (summary ? '. ' : '') + trimmed
  }
  return summary + '.'
}

// Archive sources with pagination support
interface ArchiveSource {
  name: string
  category: 'ai' | 'startups' | 'dev' | 'product' | 'research'
  // Function to get URL for a specific page
  getUrl: (page: number) => string
  // Max pages to fetch
  maxPages: number
}

const ARCHIVE_SOURCES: ArchiveSource[] = [
  // TechCrunch - AI
  {
    name: 'TechCrunch AI',
    category: 'ai',
    getUrl: (page) => `https://techcrunch.com/category/artificial-intelligence/feed/?paged=${page}`,
    maxPages: 20,
  },
  // TechCrunch - Startups
  {
    name: 'TechCrunch Startups',
    category: 'startups',
    getUrl: (page) => `https://techcrunch.com/category/startups/feed/?paged=${page}`,
    maxPages: 20,
  },
  // The Verge - AI
  {
    name: 'The Verge AI',
    category: 'ai',
    getUrl: (_page) => 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    maxPages: 1,
  },
  // VentureBeat - AI
  {
    name: 'VentureBeat AI',
    category: 'ai',
    getUrl: (page) => `https://venturebeat.com/category/ai/feed/?paged=${page}`,
    maxPages: 15,
  },
  // Ars Technica
  {
    name: 'Ars Technica',
    category: 'research',
    getUrl: (_page) => 'https://feeds.arstechnica.com/arstechnica/index',
    maxPages: 1,
  },
  // Dev.to
  {
    name: 'Dev.to',
    category: 'dev',
    getUrl: (_page) => 'https://dev.to/feed',
    maxPages: 1,
  },
  // GitHub Blog
  {
    name: 'GitHub Blog',
    category: 'dev',
    getUrl: (_page) => 'https://github.blog/feed/',
    maxPages: 1,
  },
  // The New Stack
  {
    name: 'The New Stack',
    category: 'dev',
    getUrl: (page) => `https://thenewstack.io/feed/?paged=${page}`,
    maxPages: 10,
  },
  // InfoQ
  {
    name: 'InfoQ',
    category: 'dev',
    getUrl: (_page) => 'https://feed.infoq.com/',
    maxPages: 1,
  },
  // Wired
  {
    name: 'Wired',
    category: 'ai',
    getUrl: (_page) => 'https://www.wired.com/feed/tag/ai/latest/rss',
    maxPages: 1,
  },
  // MIT Technology Review
  {
    name: 'MIT Technology Review',
    category: 'ai',
    getUrl: (_page) => 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    maxPages: 1,
  },
  // Product Hunt
  {
    name: 'Product Hunt',
    category: 'product',
    getUrl: (_page) => 'https://www.producthunt.com/feed',
    maxPages: 1,
  },
  // Crunchbase News
  {
    name: 'Crunchbase News',
    category: 'startups',
    getUrl: (_page) => 'https://news.crunchbase.com/feed/',
    maxPages: 1,
  },
  // The Next Web
  {
    name: 'The Next Web',
    category: 'startups',
    getUrl: (page) => `https://thenextweb.com/feed?paged=${page}`,
    maxPages: 10,
  },
  // The Register
  {
    name: 'The Register',
    category: 'dev',
    getUrl: (_page) => 'https://www.theregister.com/headlines.atom',
    maxPages: 1,
  },
  // BBC Technology
  {
    name: 'BBC Technology',
    category: 'ai',
    getUrl: (_page) => 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    maxPages: 1,
  },
  // ZDNet
  {
    name: 'ZDNet',
    category: 'dev',
    getUrl: (_page) => 'https://www.zdnet.com/news/rss.xml',
    maxPages: 1,
  },
]

interface Article {
  title: string
  summary: string
  body: string
  category: string
  companies: string[]
  source: string
  source_url: string
  image_url: string | null
  published_at: string
}

async function fetchFeed(url: string): Promise<Parser.Output<CustomItem> | null> {
  try {
    const feed = await parser.parseURL(url)
    return feed
  } catch (error) {
    return null
  }
}

async function crawlSource(source: ArchiveSource, existingUrls: Set<string>): Promise<Article[]> {
  const articles: Article[] = []

  for (let page = 1; page <= source.maxPages; page++) {
    const url = source.getUrl(page)
    console.log(`   Page ${page}/${source.maxPages}: ${url.slice(0, 60)}...`)

    const feed = await fetchFeed(url)
    if (!feed || !feed.items || feed.items.length === 0) {
      console.log(`   ⏭️  No more items`)
      break
    }

    let newCount = 0
    for (const item of feed.items) {
      if (!item.title || !item.link) continue

      // Skip if already exists
      if (existingUrls.has(item.link)) continue

      // Validate URL
      try {
        const parsedUrl = new URL(item.link)
        if (parsedUrl.pathname === '/' || parsedUrl.pathname === '') continue
      } catch {
        continue
      }

      const body = item.contentSnippet || item.content || item.summary || ''
      const summary = generateSummary(body)
      if (!summary || summary.length < 50) continue

      const title = stripHtml(item.title).slice(0, 500)
      const companies = extractCompanies(title, summary)

      articles.push({
        title,
        summary: summary.slice(0, 500),
        body: stripHtml(body).slice(0, 5000),
        category: source.category,
        companies,
        source: source.name.replace(/ AI$| Startups$/, ''),
        source_url: item.link,
        image_url: extractImageUrl(item as CustomItem & Parser.Item) || null,
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      })

      existingUrls.add(item.link)
      newCount++
    }

    console.log(`   ✅ Found ${newCount} new articles`)

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return articles
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const weeksArg = args.find(a => a.startsWith('--weeks='))
  const targetWeeks = weeksArg ? parseInt(weeksArg.split('=')[1], 10) : 12

  console.log('\n📰 Historical News Backfill')
  console.log('=' .repeat(50))
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Target: ${targetWeeks} weeks of data`)
  console.log(`Sources: ${ARCHIVE_SOURCES.length}`)
  console.log('=' .repeat(50) + '\n')

  // Get existing URLs to avoid duplicates
  console.log('📥 Fetching existing articles...')
  const { data: existing, error: fetchError } = await supabase
    .from('news_items')
    .select('source_url')

  if (fetchError) {
    console.error(`❌ Failed to fetch existing: ${fetchError.message}`)
    process.exit(1)
  }

  const existingUrls = new Set(existing?.map(e => e.source_url) || [])
  console.log(`   Found ${existingUrls.size} existing articles\n`)

  // Crawl each source
  const allArticles: Article[] = []
  const stats: Record<string, number> = {}

  for (const source of ARCHIVE_SOURCES) {
    console.log(`\n📡 ${source.name} (${source.category})`)

    try {
      const articles = await crawlSource(source, existingUrls)
      allArticles.push(...articles)
      stats[source.name] = articles.length
      console.log(`   Total: ${articles.length} articles`)
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      stats[source.name] = 0
    }
  }

  // Calculate date distribution
  const now = new Date()
  const weekDist: Record<string, number> = {}
  allArticles.forEach(a => {
    const date = new Date(a.published_at)
    const weekNum = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000))
    const key = `Week-${weekNum}`
    weekDist[key] = (weekDist[key] || 0) + 1
  })

  console.log('\n📊 Week Distribution:')
  Object.entries(weekDist)
    .sort((a, b) => parseInt(a[0].split('-')[1]) - parseInt(b[0].split('-')[1]))
    .forEach(([week, count]) => {
      console.log(`   ${week}: ${count} articles`)
    })

  // Insert to DB
  if (!isDryRun && allArticles.length > 0) {
    console.log('\n💾 Inserting to database...')

    // Insert in batches
    const batchSize = 50
    let inserted = 0
    let errors = 0

    for (let i = 0; i < allArticles.length; i += batchSize) {
      const batch = allArticles.slice(i, i + batchSize)

      const { error: insertError } = await supabase
        .from('news_items')
        .upsert(batch, { onConflict: 'source_url', ignoreDuplicates: true })

      if (insertError) {
        console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1} error: ${insertError.message}`)
        errors += batch.length
      } else {
        inserted += batch.length
        process.stdout.write(`   Inserted: ${inserted}/${allArticles.length}\r`)
      }
    }

    console.log(`\n   ✅ Inserted: ${inserted}, Errors: ${errors}`)
  }

  // Summary
  console.log('\n' + '=' .repeat(50))
  console.log('📊 Backfill Summary')
  console.log('=' .repeat(50))
  console.log(`Total new articles: ${allArticles.length}`)
  console.log(`Sources processed: ${Object.keys(stats).length}`)
  console.log('\nBy source:')
  Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      if (count > 0) console.log(`   ${source}: ${count}`)
    })

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN - No changes made')
  }
  console.log('=' .repeat(50) + '\n')
}

main().catch(console.error)
