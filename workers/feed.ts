/**
 * Dynamic RSS Feed Worker
 *
 * Generates RSS feed from Supabase in real-time
 * Endpoint: /feed.xml
 */

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  source_url: string
  category: string
  published_at: string
  image_url: string | null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      // Validate environment
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        console.error('Missing env vars:', { url: !!env.SUPABASE_URL, key: !!env.SUPABASE_ANON_KEY })
        return new Response('Configuration error', { status: 500 })
      }

      // Fetch latest 50 articles from Supabase
      const supabaseUrl = `${env.SUPABASE_URL}/rest/v1/news_items?select=id,title,summary,source,source_url,category,published_at,image_url&order=published_at.desc&limit=50`

      console.log('Fetching from:', supabaseUrl)

      const response = await fetch(supabaseUrl, {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Supabase error:', response.status, errorText)
        throw new Error(`Supabase error: ${response.status} - ${errorText}`)
      }

      const items: NewsItem[] = await response.json()
      console.log('Fetched items:', items.length)

      // Generate RSS XML
      const rssXml = generateRssXml(items)

      return new Response(rssXml, {
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      })
    } catch (error) {
      console.error('RSS feed error:', error)
      return new Response('Internal server error', { status: 500 })
    }
  },
}

function generateRssXml(newsItems: NewsItem[]): string {
  const now = new Date().toUTCString()

  const items = newsItems
    .map((item) => {
      const pubDate = new Date(item.published_at).toUTCString()
      const description = item.summary || item.title

      return `    <item>
      <title><![CDATA[${escapeXml(item.title)}]]></title>
      <link>${escapeXml(item.source_url)}</link>
      <description><![CDATA[${escapeXml(description)}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <source url="${escapeXml(item.source_url)}">${escapeXml(item.source)}</source>
      <guid isPermaLink="true">${escapeXml(item.source_url)}</guid>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Upday - Tech News, Faster</title>
    <link>https://updayapp.com</link>
    <description>AI-summarized tech news in real-time. Stay ahead with the latest in AI, startups, science, and dev.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://updayapp.com/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
