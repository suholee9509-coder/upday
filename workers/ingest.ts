/**
 * News Ingestion Worker for Cloudflare
 * Runs on a cron schedule to fetch and process news
 *
 * Configure in wrangler.toml:
 * [[triggers]]
 * crons = ["0 * * * *"]  # Every hour
 */

import { createClient } from '@supabase/supabase-js'

interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  CRON_SECRET?: string
}

interface RawArticle {
  title: string
  body: string
  sourceUrl: string
  source: string
  publishedAt: string
  category: string
}

// RSS Sources (simplified for Worker environment)
const RSS_SOURCES = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge', category: 'ai' },
  { url: 'https://techcrunch.com/category/startups/feed/', source: 'TechCrunch', category: 'startup' },
  { url: 'https://spacenews.com/feed/', source: 'SpaceNews', category: 'space' },
  { url: 'https://dev.to/feed', source: 'Dev.to', category: 'dev' },
]

/**
 * Simple RSS parser for Workers (no external dependencies)
 */
async function parseRSS(url: string): Promise<{ title: string; link: string; content: string; pubDate: string }[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'upday-news-bot/1.0' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const xml = await response.text()
    const items: { title: string; link: string; content: string; pubDate: string }[] = []

    // Simple XML parsing (works for most RSS feeds)
    const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []

    for (const itemXml of itemMatches.slice(0, 10)) {
      const title = itemXml.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] || ''
      const link = itemXml.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1] || ''
      const content = itemXml.match(/<(?:content:encoded|description)[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/(?:content:encoded|description)>/i)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || ''

      if (title && link) {
        items.push({
          title: cleanText(title),
          link: cleanText(link),
          content: cleanText(content),
          pubDate: pubDate.trim(),
        })
      }
    }

    return items
  } catch (error) {
    console.error(`Failed to parse RSS from ${url}:`, error)
    return []
  }
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
 * Main ingestion function
 */
async function runIngestion(env: Env): Promise<{ processed: number; errors: string[] }> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const errors: string[] = []
  let processed = 0

  for (const source of RSS_SOURCES) {
    try {
      const items = await parseRSS(source.url)
      console.log(`Fetched ${items.length} items from ${source.source}`)

      for (const item of items) {
        // Check if already exists
        const { data: existing } = await supabase
          .from('news_items')
          .select('id')
          .eq('source_url', item.link)
          .limit(1)

        if (existing && existing.length > 0) {
          continue // Skip duplicates
        }

        const summary = generateSummary(item.content)

        const { error } = await supabase.from('news_items').insert({
          title: item.title,
          summary: summary,
          body: item.content.substring(0, 5000),
          category: source.category,
          source: source.source,
          source_url: item.link,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        })

        if (error) {
          errors.push(`Failed to insert: ${error.message}`)
        } else {
          processed++
        }
      }
    } catch (error) {
      errors.push(`Source ${source.source}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return { processed, errors }
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

    const result = await runIngestion(env)

    return new Response(JSON.stringify(result), {
      status: result.errors.length > 0 ? 207 : 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },

  // Cron handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runIngestion(env).then(result => {
        console.log(`Ingestion completed: ${result.processed} articles processed`)
        if (result.errors.length > 0) {
          console.error('Errors:', result.errors)
        }
      })
    )
  },
}
