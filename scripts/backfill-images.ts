#!/usr/bin/env npx tsx
/**
 * Backfill Image URLs Script
 *
 * Fetches og:image from article source URLs for articles missing images.
 * Run: npx tsx scripts/backfill-images.ts
 *
 * Options:
 *   --dry-run    Preview changes without updating DB
 *   --limit=N    Process only N articles (default: 50)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const FETCH_TIMEOUT_MS = 5000 // 5 seconds per page

interface NewsItem {
  id: string
  title: string
  source_url: string
  image_url: string | null
}

/**
 * Fetch og:image from a URL
 */
async function fetchOgImage(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; upday-bot/1.0)',
        'Accept': 'text/html',
      },
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!response.ok) return null

    const html = await response.text()

    // Try og:image first
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*\/?>/i)?.[1]
    if (ogImage) return ogImage

    // Try twitter:image
    const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*\/?>/i)?.[1]
    if (twitterImage) return twitterImage

    return null
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50

  console.log('\n🖼️  Image Backfill Script')
  console.log('==================================================')
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log(`Limit: ${limit}`)
  console.log('==================================================\n')

  // Check environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch articles without images
  console.log('📥 Fetching articles without images...')

  const { data: articles, error } = await supabase
    .from('news_items')
    .select('id, title, source_url, image_url')
    .is('image_url', null)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`❌ Database error: ${error.message}`)
    process.exit(1)
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No articles need image backfilling!')
    return
  }

  console.log(`📰 Found ${articles.length} articles without images\n`)

  // Process articles
  let processed = 0
  let updated = 0
  let failed = 0

  for (const article of articles as NewsItem[]) {
    processed++
    const progress = `[${processed}/${articles.length}]`

    console.log(`${progress} Processing: "${article.title.substring(0, 50)}..."`)

    try {
      const imageUrl = await fetchOgImage(article.source_url)

      if (imageUrl) {
        console.log(`  ✅ Found: ${imageUrl.substring(0, 60)}...`)
        updated++

        if (!isDryRun) {
          const { error: updateError } = await supabase
            .from('news_items')
            .update({ image_url: imageUrl })
            .eq('id', article.id)

          if (updateError) {
            console.log(`  ⚠️  Update failed: ${updateError.message}`)
            failed++
          }
        }
      } else {
        console.log(`  ⏭️  No og:image found`)
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : 'Unknown'}`)
      failed++
    }
  }

  // Summary
  console.log('\n==================================================')
  console.log('📊 Backfill Summary')
  console.log('==================================================')
  console.log(`Total processed: ${processed}`)
  console.log(`Images found: ${updated}`)
  console.log(`Failed: ${failed}`)
  if (isDryRun) {
    console.log('\n⚠️  DRY RUN - No changes were made')
    console.log('Run without --dry-run to apply changes')
  }
  console.log('==================================================\n')
}

main().catch(console.error)
