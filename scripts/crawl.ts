/**
 * RSS Crawling Script
 *
 * Usage: npx tsx scripts/crawl.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Import crawling functions
import Parser from 'rss-parser'

type Category = 'ai' | 'startup' | 'science' | 'design' | 'space' | 'dev'

interface RSSSource {
  url: string
  source: string
  categories: Category[]
}

const RSS_SOURCES: RSSSource[] = [
  // AI
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', categories: ['ai'] },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge', categories: ['ai'] },

  // Startup
  { url: 'https://techcrunch.com/category/startups/feed/', source: 'TechCrunch', categories: ['startup'] },

  // Science
  { url: 'https://feeds.arstechnica.com/arstechnica/science', source: 'Ars Technica', categories: ['science'] },

  // Space
  { url: 'https://spacenews.com/feed/', source: 'SpaceNews', categories: ['space'] },
  { url: 'https://feeds.arstechnica.com/arstechnica/space', source: 'Ars Technica', categories: ['space'] },

  // Dev
  { url: 'https://dev.to/feed', source: 'Dev.to', categories: ['dev'] },
  { url: 'https://blog.github.com/feed.xml', source: 'GitHub Blog', categories: ['dev'] },
]

type CustomItem = {
  'media:content'?: { $?: { url?: string } }
  'media:thumbnail'?: { $?: { url?: string } }
  enclosure?: { url?: string }
  'content:encoded'?: string
}

const parser = new Parser<object, CustomItem>({
  timeout: 15000,
  headers: { 'User-Agent': 'upday-news-bot/1.0' },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'content:encoded'],
    ],
  },
})

function extractImageUrl(item: CustomItem & Parser.Item): string | undefined {
  if (item['media:content']?.$?.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url
  if (item.enclosure?.url?.match(/\.(jpg|jpeg|png|gif|webp)/i)) return item.enclosure.url
  const content = item['content:encoded'] || item.content || ''
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch?.[1]) return imgMatch[1]
  return undefined
}

function generateSummary(body: string): string {
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 20)
  if (sentences.length === 0) return ''
  let summary = ''
  for (const sentence of sentences.slice(0, 2)) {
    const trimmed = sentence.trim()
    if (summary.length + trimmed.length > 200) break
    summary += (summary ? '. ' : '') + trimmed
  }
  return summary + '.'
}

async function crawlAndStore() {
  console.log('🚀 Starting RSS crawl...\n')

  // First, clear old data
  console.log('🗑️  Clearing old data...')
  await supabase.from('news_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  let totalStored = 0

  for (const source of RSS_SOURCES) {
    try {
      console.log(`📡 Crawling ${source.source} (${source.url})...`)
      const feed = await parser.parseURL(source.url)

      const articles = []
      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue

        // Validate URL is an actual article
        try {
          const url = new URL(item.link)
          if (url.pathname === '/' || url.pathname === '') continue
        } catch {
          continue
        }

        const body = item.contentSnippet || item.content || item.summary || ''
        const summary = generateSummary(body)
        if (!summary) continue

        articles.push({
          title: item.title.slice(0, 500),
          summary: summary.slice(0, 500),
          body: body.slice(0, 5000),
          category: source.categories[0],
          source: source.source,
          source_url: item.link,
          image_url: extractImageUrl(item as CustomItem & Parser.Item) || null,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        })
      }

      if (articles.length > 0) {
        const { error } = await supabase
          .from('news_items')
          .upsert(articles, { onConflict: 'source_url', ignoreDuplicates: true })

        if (error) {
          console.error(`   ❌ Error: ${error.message}`)
        } else {
          console.log(`   ✅ Stored ${articles.length} articles`)
          totalStored += articles.length
        }
      } else {
        console.log(`   ⚠️  No valid articles found`)
      }
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`)
    }
  }

  console.log(`\n✨ Done! Total articles stored: ${totalStored}`)
}

crawlAndStore().catch(console.error)
