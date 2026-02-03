#!/usr/bin/env npx tsx
/**
 * Crawl Monitoring Script
 * Run: npx tsx scripts/monitor.ts
 *
 * Shows stats from Supabase about crawled articles
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function getStats() {
  console.log('\n📊 upday Crawl Monitor\n')
  console.log('='.repeat(50))

  // Total articles
  const { count: totalCount } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })

  console.log(`\n📰 Total Articles: ${totalCount?.toLocaleString() || 0}`)

  // Articles by category
  console.log('\n📁 By Category:')
  const categories = ['ai', 'startup', 'science', 'design', 'space', 'dev']

  for (const cat of categories) {
    const { count } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', cat)

    const bar = '█'.repeat(Math.min(Math.floor((count || 0) / 10), 30))
    console.log(`  ${cat.padEnd(8)} ${String(count || 0).padStart(5)} ${bar}`)
  }

  // Articles by source (top 10)
  console.log('\n🌐 Top Sources:')
  const { data: sources } = await supabase
    .from('news_items')
    .select('source')

  if (sources) {
    const sourceCounts: Record<string, number> = {}
    sources.forEach(s => {
      sourceCounts[s.source] = (sourceCounts[s.source] || 0) + 1
    })

    const sorted = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    for (const [source, count] of sorted) {
      const pct = ((count / (totalCount || 1)) * 100).toFixed(1)
      const bar = '█'.repeat(Math.min(Math.floor(count / 5), 20))
      console.log(`  ${source.padEnd(20)} ${String(count).padStart(4)} (${pct}%) ${bar}`)
    }
  }

  // Recent articles (last 24h)
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  const { count: recentCount } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())

  console.log(`\n⏰ Last 24 Hours: ${recentCount || 0} new articles`)

  // Recent articles (last 4h - one cron cycle)
  const fourHoursAgo = new Date()
  fourHoursAgo.setHours(fourHoursAgo.getHours() - 4)

  const { count: lastCronCount } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', fourHoursAgo.toISOString())

  console.log(`   Last 4 Hours:  ${lastCronCount || 0} new articles`)

  // Latest articles
  console.log('\n📝 Latest Articles:')
  const { data: latest } = await supabase
    .from('news_items')
    .select('title, source, category, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (latest) {
    for (const article of latest) {
      const time = new Date(article.created_at).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      console.log(`  [${time}] [${article.category}] ${article.title.substring(0, 50)}...`)
      console.log(`           └─ ${article.source}`)
    }
  }

  // AI Cache stats (if table exists)
  try {
    const { count: cacheCount } = await supabase
      .from('ai_response_cache')
      .select('*', { count: 'exact', head: true })

    if (cacheCount !== null) {
      console.log(`\n🧠 AI Cache Entries: ${cacheCount}`)
    }
  } catch {
    // Table might not exist
  }

  console.log('\n' + '='.repeat(50))
  console.log('View Workers logs: https://dash.cloudflare.com → Workers → upday-ingest → Logs')
  console.log('')
}

getStats().catch(console.error)
