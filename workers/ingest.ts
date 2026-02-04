/**
 * News Ingestion Worker for Cloudflare
 * Runs on a cron schedule to fetch and process news
 *
 * Schedule: Every 4 hours (cron: 0 0,4,8,12,16,20 * * *)
 * Deploy: wrangler deploy -c wrangler-ingest.toml
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const FETCH_TIMEOUT_MS = 10000 // 10 seconds per feed
const MAX_ARTICLES_PER_FEED = 10
const MAX_RETRIES = 3 // Retry count for failed fetches

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  CRON_SECRET?: string
}

interface CrawlStats {
  processed: number
  skipped: number
  errors: number
  feedsProcessed: number
  feedsFailed: number
  startTime: number
  endTime?: number
}

interface FeedResult {
  source: string
  processed: number
  skipped: number
  error?: string
}

// RSS Sources - Synchronized with src/lib/rss-feeds.ts
// NOTE: Keep this in sync with the shared configuration
// Workers environment cannot use Vite aliases, so we duplicate the config
const RSS_SOURCES = [
  // AI - 7 sources
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge', category: 'ai' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat', category: 'ai' },
  { url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', source: 'MIT Technology Review', category: 'ai' },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired', category: 'ai' },
  { url: 'https://www.engadget.com/rss.xml', source: 'Engadget', category: 'ai' },
  { url: 'https://gizmodo.com/rss', source: 'Gizmodo', category: 'ai' },

  // Startups - 4 sources
  { url: 'https://techcrunch.com/category/startups/feed/', source: 'TechCrunch', category: 'startups' },
  { url: 'https://news.crunchbase.com/feed/', source: 'Crunchbase News', category: 'startups' },
  { url: 'https://restofworld.org/feed/latest/', source: 'Rest of World', category: 'startups' },
  { url: 'https://thenextweb.com/feed', source: 'The Next Web', category: 'startups' },

  // Research (Science) - 5 sources
  { url: 'https://feeds.arstechnica.com/arstechnica/science', source: 'Ars Technica', category: 'research' },
  { url: 'https://www.sciencedaily.com/rss/all.xml', source: 'Science Daily', category: 'research' },
  { url: 'https://phys.org/rss-feed/', source: 'Phys.org', category: 'research' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Technology Review', category: 'research' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired', category: 'research' },

  // Product (Design) - 6 sources
  { url: 'https://feeds.feedburner.com/fastcompany/headlines', source: 'Fast Company', category: 'product' },
  { url: 'https://www.dezeen.com/feed/', source: 'Dezeen', category: 'product' },
  { url: 'https://www.designboom.com/feed/', source: 'Designboom', category: 'product' },
  { url: 'https://feeds.feedburner.com/core77/blog', source: 'Core77', category: 'product' },
  { url: 'https://alistapart.com/main/feed/', source: 'A List Apart', category: 'product' },
  { url: 'https://smashingmagazine.com/feed', source: 'Smashing Magazine', category: 'product' },

  // Research (Space) - 4 sources
  { url: 'https://spacenews.com/feed/', source: 'SpaceNews', category: 'research' },
  { url: 'https://arstechnica.com/tag/space/feed/', source: 'Ars Technica', category: 'research' },
  { url: 'https://www.nasa.gov/feed/', source: 'NASA', category: 'research' },
  { url: 'https://www.space.com/feeds/all', source: 'Space.com', category: 'research' },

  // Dev - 10 sources
  { url: 'https://dev.to/feed', source: 'Dev.to', category: 'dev' },
  { url: 'https://news.ycombinator.com/rss', source: 'Hacker News', category: 'dev' },
  { url: 'https://github.blog/feed/', source: 'GitHub Blog', category: 'dev' },
  { url: 'https://thenewstack.io/feed/', source: 'The New Stack', category: 'dev' },
  { url: 'https://feed.infoq.com/', source: 'InfoQ', category: 'dev' },
  { url: 'https://www.theregister.com/headlines.atom', source: 'The Register', category: 'dev' },
  { url: 'https://css-tricks.com/feed/', source: 'CSS-Tricks', category: 'dev' },
  { url: 'https://www.tomshardware.com/feeds/all', source: "Tom's Hardware", category: 'dev' },
  { url: 'https://9to5mac.com/feed/', source: '9to5Mac', category: 'dev' },
  { url: 'https://www.androidcentral.com/feed', source: 'Android Central', category: 'dev' },

  // General Tech - Global authoritative sources (5 sources)
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Technology', category: 'ai' },
  { url: 'https://www.zdnet.com/news/rss.xml', source: 'ZDNet', category: 'dev' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NY Times Tech', category: 'ai' },
  { url: 'https://www.theguardian.com/technology/rss', source: 'The Guardian Tech', category: 'ai' },
  { url: 'https://www.cnet.com/rss/news/', source: 'CNET', category: 'ai' },
  { url: 'https://mashable.com/feeds/rss/all', source: 'Mashable', category: 'startups' },
  { url: 'https://www.techradar.com/rss', source: 'TechRadar', category: 'dev' },
  { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', category: 'ai' },

  // Company Official Blogs - Primary sources for company news (10 sources)
  { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI Blog', category: 'ai' },
  { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', category: 'ai' },
  { url: 'https://blogs.microsoft.com/feed/', source: 'Microsoft Blog', category: 'ai' },
  { url: 'https://engineering.fb.com/feed/', source: 'Meta Engineering', category: 'ai' },
  { url: 'https://blogs.nvidia.com/feed/', source: 'NVIDIA Blog', category: 'ai' },
  { url: 'https://vercel.com/atom', source: 'Vercel Blog', category: 'dev' },
  { url: 'https://supabase.com/blog/rss.xml', source: 'Supabase Blog', category: 'dev' },
  { url: 'https://blog.cloudflare.com/rss/', source: 'Cloudflare Blog', category: 'dev' },
  { url: 'https://stripe.com/blog/feed.rss', source: 'Stripe Blog', category: 'dev' },
  { url: 'https://shopify.engineering/blog.atom', source: 'Shopify Engineering', category: 'dev' },
]

// Company list for keyword matching (synced with src/lib/constants.ts)
// Maps company slug to search patterns (name variations)
const COMPANY_PATTERNS: Record<string, RegExp> = {
  'openai': /\bopen\s?ai\b/i,
  'anthropic': /\banthropic\b/i,
  'google': /\bgoogle\b/i,
  'microsoft': /\bmicrosoft\b/i,
  'meta': /\bmeta\b(?!\s*data)/i, // Avoid "metadata"
  'nvidia': /\bnvidia\b/i,
  'xai': /\bx\.?ai\b/i,
  'mistral': /\bmistral\b/i,
  'vercel': /\bvercel\b/i,
  'supabase': /\bsupabase\b/i,
  'cloudflare': /\bcloudflare\b/i,
  'linear': /\blinear\b(?!\s*regression)/i, // Avoid "linear regression"
  'figma': /\bfigma\b/i,
  'notion': /\bnotion\b/i,
  'cursor': /\bcursor\b(?!\s*position)/i, // Avoid "cursor position"
  'github': /\bgithub\b/i,
  'databricks': /\bdatabricks\b/i,
  'apple': /\bapple\b(?!\s*(?:pie|cider|tree))/i, // Avoid food references
  'amazon': /\bamazon\b/i,
  'tesla': /\btesla\b/i,
  'stripe': /\bstripe\b(?!\s*(?:pattern|shirt))/i, // Avoid fashion references
  'shopify': /\bshopify\b/i,
  'slack': /\bslack\b(?!\s*(?:off|time))/i, // Avoid "slack off"
  'discord': /\bdiscord\b/i,
  'reddit': /\breddit\b/i,
}

/**
 * Extract companies mentioned in title/summary using keyword matching
 * Returns all mentioned companies (filtering done on frontend)
 */
function extractCompanies(title: string, summary: string): string[] {
  const text = `${title} ${summary}`.toLowerCase()
  const companies: string[] = []

  for (const [slug, pattern] of Object.entries(COMPANY_PATTERNS)) {
    if (pattern.test(text)) {
      companies.push(slug)
    }
  }

  if (companies.length > 0) {
    console.log(`[COMPANY] Matched: ${companies.join(', ')} for "${title.substring(0, 50)}..."`)
  }

  return companies
}

/**
 * Fetch with timeout using AbortController
 * Follows redirects automatically
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'upday-news-bot/1.0' },
      signal: controller.signal,
      redirect: 'follow', // Follow redirects automatically
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(url: string, maxRetries: number = MAX_RETRIES): Promise<Response> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS)
      if (response.ok || response.status < 500) {
        return response // Success or client error (don't retry 4xx)
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
        console.log(`[RETRY] ${url} - attempt ${attempt + 1}/${maxRetries}, waiting ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

interface RSSItem {
  title: string
  link: string
  content: string
  pubDate: string
  imageUrl: string | null
}

/**
 * Extract image URL from RSS item XML
 * Tries multiple sources: enclosure, media:content, media:thumbnail, img in content
 */
function extractImageUrl(itemXml: string, rawContent: string): string | null {
  // 1. RSS <enclosure> tag with image type
  const enclosure = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image\/[^"']+["'][^>]*\/?>/i)?.[1]
    || itemXml.match(/<enclosure[^>]*type=["']image\/[^"']+["'][^>]*url=["']([^"']+)["'][^>]*\/?>/i)?.[1]
  if (enclosure) return enclosure

  // 2. Media namespace tags (media:content, media:thumbnail)
  const mediaContent = itemXml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*\/?>/i)?.[1]
  if (mediaContent && /\.(jpg|jpeg|png|gif|webp)/i.test(mediaContent)) return mediaContent

  const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*\/?>/i)?.[1]
  if (mediaThumbnail) return mediaThumbnail

  // 3. First <img> tag in content (before cleaning)
  const imgInContent = rawContent.match(/<img[^>]*src=["']([^"']+)["'][^>]*\/?>/i)?.[1]
  if (imgInContent && !imgInContent.includes('data:') && !imgInContent.includes('tracking')) return imgInContent

  // 4. <image><url> tag (some feeds use this)
  const imageTag = itemXml.match(/<image[^>]*>[\s\S]*?<url>([^<]+)<\/url>[\s\S]*?<\/image>/i)?.[1]
  if (imageTag) return imageTag

  return null
}

/**
 * Simple RSS/Atom parser for Workers (no external dependencies)
 * Supports both RSS <item> tags and Atom <entry> tags
 */
async function parseRSS(url: string): Promise<RSSItem[]> {
  const response = await fetchWithRetry(url)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const xml = await response.text()
  const items: RSSItem[] = []

  // Try RSS <item> tags first
  let itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []

  // If no RSS items, try Atom <entry> tags
  if (itemMatches.length === 0) {
    itemMatches = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi) || []
  }

  for (const itemXml of itemMatches.slice(0, MAX_ARTICLES_PER_FEED)) {
    // Parse title - handle CDATA with leading/trailing whitespace
    let titleRaw = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''
    // Extract CDATA content if present (handles whitespace around CDATA)
    const titleCdata = titleRaw.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i)
    const title = titleCdata ? titleCdata[1].trim() : titleRaw.trim()

    // Parse link - RSS uses <link>text</link>, Atom uses <link href="..."/>
    let link = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1] || ''
    if (!link) {
      // Try Atom-style link with href attribute
      link = itemXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1] || ''
    }

    // Parse content - try multiple content tags (keep raw for image extraction)
    const rawContent = itemXml.match(/<(?:content:encoded|content|description|summary)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:content:encoded|content|description|summary)>/i)?.[1] || ''

    // Parse date - RSS uses pubDate, Atom uses published or updated, Dublin Core uses dc:date
    let pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || ''
    if (!pubDate) {
      pubDate = itemXml.match(/<(?:published|updated)[^>]*>([\s\S]*?)<\/(?:published|updated)>/i)?.[1] || ''
    }
    if (!pubDate) {
      // Dublin Core date format (used by A List Apart, etc.)
      pubDate = itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1] || ''
    }

    // Extract image URL before cleaning content
    const imageUrl = extractImageUrl(itemXml, rawContent)

    if (title && link) {
      items.push({
        title: cleanText(title),
        link: cleanText(link),
        content: cleanText(rawContent),
        pubDate: pubDate.trim(),
        imageUrl,
      })
    }
  }

  return items
}

/**
 * Clean text from HTML and entities
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generate simple summary (first 2 sentences)
 */
function generateSummary(body: string): string {
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 20)
  if (sentences.length === 0) return body.substring(0, 200)

  let summary = ''
  for (const sentence of sentences.slice(0, 2)) {
    const trimmed = sentence.trim()
    if (summary.length + trimmed.length > 200) break
    summary += (summary ? '. ' : '') + trimmed
  }

  return summary + '.'
}

/**
 * Process a single feed with error isolation
 */
async function processFeed(
  feed: { url: string; source: string; category: string },
  supabase: ReturnType<typeof createClient>
): Promise<FeedResult> {
  const result: FeedResult = { source: feed.source, processed: 0, skipped: 0 }

  try {
    const items = await parseRSS(feed.url)
    console.log(`[FEED] ${feed.source}: Fetched ${items.length} items`)

    for (const item of items) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('news_items')
          .select('id')
          .eq('source_url', item.link)
          .limit(1)

        if (existing && existing.length > 0) {
          result.skipped++
          continue
        }

        const summary = generateSummary(item.content)

        // Extract companies using keyword matching
        const companies = extractCompanies(item.title, summary)

        const { error } = await supabase.from('news_items').insert({
          title: item.title,
          summary: summary,
          body: item.content.substring(0, 5000),
          category: feed.category,
          companies: companies,
          source: feed.source,
          source_url: item.link,
          image_url: item.imageUrl,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        })

        if (error) {
          console.error(`[ERROR] Insert failed for ${item.link}: ${error.message}`)
          result.error = error.message
        } else {
          result.processed++
        }
      } catch (itemError) {
        console.error(`[ERROR] Item processing failed: ${itemError instanceof Error ? itemError.message : 'Unknown'}`)
      }
    }
  } catch (feedError) {
    const errorMsg = feedError instanceof Error ? feedError.message : 'Unknown error'
    console.error(`[ERROR] Feed ${feed.source} failed: ${errorMsg}`)
    result.error = errorMsg
  }

  return result
}

/**
 * Main ingestion function with enhanced logging
 */
async function runIngestion(env: Env): Promise<{ stats: CrawlStats; feedResults: FeedResult[] }> {
  const stats: CrawlStats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    feedsProcessed: 0,
    feedsFailed: 0,
    startTime: Date.now(),
  }

  console.log(`[CRON] ========================================`)
  console.log(`[CRON] Starting crawl at ${new Date().toISOString()}`)
  console.log(`[CRON] Feeds to process: ${RSS_SOURCES.length}`)
  console.log(`[CRON] Company tagging: enabled (keyword matching)`)
  console.log(`[CRON] ========================================`)

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const feedResults: FeedResult[] = []

  // Process feeds sequentially to avoid rate limiting
  for (const feed of RSS_SOURCES) {
    const result = await processFeed(feed, supabase)
    feedResults.push(result)

    stats.processed += result.processed
    stats.skipped += result.skipped

    if (result.error) {
      stats.feedsFailed++
      stats.errors++
    } else {
      stats.feedsProcessed++
    }
  }

  stats.endTime = Date.now()
  const duration = stats.endTime - stats.startTime

  console.log(`[CRON] ========================================`)
  console.log(`[CRON] Crawl completed at ${new Date().toISOString()}`)
  console.log(`[CRON] Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`)
  console.log(`[CRON] Feeds: ${stats.feedsProcessed}/${RSS_SOURCES.length} successful`)
  console.log(`[CRON] Articles: ${stats.processed} new, ${stats.skipped} skipped`)
  if (stats.errors > 0) {
    console.log(`[CRON] Errors: ${stats.errors}`)
  }
  console.log(`[CRON] ========================================`)

  return { stats, feedResults }
}

export default {
  // HTTP handler for manual trigger
  async fetch(request: Request, env: Env): Promise<Response> {
    // Verify authorization for manual triggers
    const authHeader = request.headers.get('Authorization')
    if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log(`[HTTP] Manual trigger received at ${new Date().toISOString()}`)

    const { stats, feedResults } = await runIngestion(env)

    return new Response(
      JSON.stringify({
        success: stats.errors === 0,
        stats: {
          processed: stats.processed,
          skipped: stats.skipped,
          errors: stats.errors,
          feedsProcessed: stats.feedsProcessed,
          feedsFailed: stats.feedsFailed,
          durationMs: stats.endTime! - stats.startTime,
        },
        feeds: feedResults,
      }),
      {
        status: stats.errors > 0 ? 207 : 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },

  // Cron handler with enhanced error handling
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[CRON] Scheduled event triggered: ${event.cron}`)

    ctx.waitUntil(
      runIngestion(env)
        .then(({ stats }) => {
          if (stats.errors > 0) {
            console.warn(`[CRON] Completed with ${stats.errors} errors`)
          }
        })
        .catch((error) => {
          console.error(`[CRON] Critical failure:`, error)
          // Don't re-throw - let the worker complete gracefully
        })
    )
  },
}
