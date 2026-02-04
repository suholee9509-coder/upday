#!/usr/bin/env npx tsx
/**
 * Backfill published_at dates from RSS feeds or og:article:published_time
 * Run: npx tsx scripts/backfill-dates.ts
 * Dry run: npx tsx scripts/backfill-dates.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const isDryRun = process.argv.includes('--dry-run')

async function fetchPublishedDate(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      headers: { 'User-Agent': 'upday-backfill/1.0' },
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) return null

    const html = await response.text()

    // Try og:article:published_time first
    const ogPublished = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']article:published_time["'][^>]*\/?>/i)?.[1]

    if (ogPublished && isValidDate(ogPublished)) return ogPublished

    // Try datePublished in JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    if (jsonLdMatch) {
      for (const script of jsonLdMatch) {
        const jsonContent = script.replace(/<\/?script[^>]*>/gi, '')
        try {
          const data = JSON.parse(jsonContent)
          const datePublished = data.datePublished || data['@graph']?.[0]?.datePublished
          if (datePublished && isValidDate(datePublished)) return datePublished
        } catch {
          // Invalid JSON, continue
        }
      }
    }

    // Try time element with datetime attribute
    const timeElement = html.match(/<time[^>]*datetime=["']([^"']+)["'][^>]*>/i)?.[1]
    if (timeElement && isValidDate(timeElement)) return timeElement

    return null
  } catch (error) {
    console.error(`  Failed to fetch ${url}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime()) && date.getFullYear() > 2000
}

async function backfillDates() {
  console.log(`\n📅 Backfill Published Dates ${isDryRun ? '(DRY RUN)' : ''}\n`)
  console.log('='.repeat(60))

  // Find articles where published_at equals created_at (indicating missing original date)
  // We check for articles where the difference is less than 1 second (1000ms)
  const { data: articles, error } = await supabase
    .from('news_items')
    .select('id, title, source, source_url, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500) // Process in batches

  if (error) {
    console.error('Error fetching articles:', error)
    return
  }

  // Filter articles where published_at is essentially the same as created_at
  const needsBackfill = articles?.filter(article => {
    const published = new Date(article.published_at).getTime()
    const created = new Date(article.created_at).getTime()
    return Math.abs(published - created) < 1000 // Within 1 second - likely missing original date
  }) || []

  console.log(`\nFound ${needsBackfill.length} articles needing date backfill\n`)

  if (needsBackfill.length === 0) {
    console.log('Nothing to backfill!')
    return
  }

  let updated = 0
  let failed = 0

  for (const article of needsBackfill) {
    console.log(`[${article.source}] ${article.title?.substring(0, 40) || 'No title'}...`)

    const publishedDate = await fetchPublishedDate(article.source_url)

    if (publishedDate) {
      const isoDate = new Date(publishedDate).toISOString()
      console.log(`  ✓ Found: ${isoDate}`)

      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ published_at: isoDate })
          .eq('id', article.id)

        if (updateError) {
          console.log(`  ✗ Update failed: ${updateError.message}`)
          failed++
        } else {
          updated++
        }
      } else {
        updated++
      }
    } else {
      console.log(`  ✗ Could not fetch date`)
      failed++
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Summary:`)
  console.log(`   ${isDryRun ? 'Would update' : 'Updated'}: ${updated}`)
  console.log(`   Failed: ${failed}`)

  if (isDryRun) {
    console.log('\nRun without --dry-run to apply changes.')
  }
}

backfillDates().catch(console.error)
