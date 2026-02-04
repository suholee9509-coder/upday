#!/usr/bin/env npx tsx
/**
 * Backfill missing titles from og:title
 * Run: npx tsx scripts/backfill-titles.ts
 * Dry run: npx tsx scripts/backfill-titles.ts --dry-run
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

async function fetchTitle(url: string): Promise<string | null> {
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

    // Try og:title first
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*\/?>/i)?.[1]

    if (ogTitle) return decodeHtmlEntities(ogTitle)

    // Fallback to <title> tag
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
    if (titleTag) return decodeHtmlEntities(titleTag.trim())

    return null
  } catch (error) {
    console.error(`  Failed to fetch ${url}:`, error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

async function backfillTitles() {
  console.log(`\n📝 Backfill Missing Titles ${isDryRun ? '(DRY RUN)' : ''}\n`)
  console.log('='.repeat(60))

  // Find articles with empty or null titles
  const { data: articles, error } = await supabase
    .from('news_items')
    .select('id, title, source, source_url')
    .or('title.is.null,title.eq.')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching articles:', error)
    return
  }

  console.log(`\nFound ${articles?.length || 0} articles with missing titles\n`)

  if (!articles || articles.length === 0) {
    console.log('Nothing to backfill!')
    return
  }

  let updated = 0
  let failed = 0

  for (const article of articles) {
    console.log(`[${article.source}] ${article.source_url.substring(0, 60)}...`)

    const title = await fetchTitle(article.source_url)

    if (title) {
      console.log(`  ✓ Found: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`)

      if (!isDryRun) {
        const { error: updateError } = await supabase
          .from('news_items')
          .update({ title })
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
      console.log(`  ✗ Could not fetch title`)
      failed++
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Summary:`)
  console.log(`   ${isDryRun ? 'Would update' : 'Updated'}: ${updated}`)
  console.log(`   Failed: ${failed}`)

  if (isDryRun) {
    console.log('\nRun without --dry-run to apply changes.')
  }
}

backfillTitles().catch(console.error)
