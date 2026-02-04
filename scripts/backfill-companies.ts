#!/usr/bin/env npx tsx
/**
 * Backfill Company Tags Script
 *
 * Updates existing articles with company tags using keyword matching.
 * Run: npx tsx scripts/backfill-companies.ts
 *
 * Options:
 *   --dry-run    Preview changes without updating DB
 *   --limit=N    Process only N articles (default: all)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

// Company patterns for keyword matching (synced with workers/ingest.ts)
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
  'linear': /\blinear\b(?!\s*regression)/i,
  'figma': /\bfigma\b/i,
  'notion': /\bnotion\b/i,
  'cursor': /\bcursor\b(?!\s*position)/i,
  'github': /\bgithub\b/i,
  'databricks': /\bdatabricks\b/i,
  'apple': /\bapple\b(?!\s*(?:pie|cider|tree))/i,
  'amazon': /\bamazon\b/i,
  'tesla': /\btesla\b/i,
  'stripe': /\bstripe\b(?!\s*(?:pattern|shirt))/i,
  'shopify': /\bshopify\b/i,
  'slack': /\bslack\b(?!\s*(?:off|time))/i,
  'discord': /\bdiscord\b/i,
  'reddit': /\breddit\b/i,
}

interface NewsItem {
  id: string
  title: string
  summary: string
  companies: string[] | null
}

/**
 * Extract companies using keyword matching
 */
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

async function main() {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  console.log('\n🏢 Company Backfill Script (Keyword Matching)')
  console.log('==================================================')
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}`)
  console.log(`Limit: ${limit || 'All articles'}`)
  console.log(`Companies: ${Object.keys(COMPANY_PATTERNS).length}`)
  console.log('==================================================\n')

  // Check environment
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Fetch articles without companies (or with empty array)
  console.log('📥 Fetching articles without company tags...')

  let query = supabase
    .from('news_items')
    .select('id, title, summary, companies')
    .or('companies.is.null,companies.eq.{}')
    .order('published_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data: articles, error } = await query

  if (error) {
    console.error(`❌ Database error: ${error.message}`)
    process.exit(1)
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No articles need backfilling!')
    return
  }

  console.log(`📰 Found ${articles.length} articles to process\n`)

  // Process articles
  let processed = 0
  let tagged = 0
  let failed = 0

  for (const article of articles as NewsItem[]) {
    processed++
    const progress = `[${processed}/${articles.length}]`

    console.log(`${progress} Processing: "${article.title.substring(0, 60)}..."`)

    try {
      const companies = extractCompanies(article.title, article.summary)

      if (companies.length > 0) {
        console.log(`  ✅ Tagged: ${companies.join(', ')}`)
        tagged++

        if (!isDryRun) {
          const { error: updateError } = await supabase
            .from('news_items')
            .update({ companies })
            .eq('id', article.id)

          if (updateError) {
            console.log(`  ⚠️  Update failed: ${updateError.message}`)
            failed++
          }
        }
      } else {
        console.log(`  ⏭️  No companies mentioned`)

        // Update to empty array to mark as processed
        if (!isDryRun) {
          await supabase
            .from('news_items')
            .update({ companies: [] })
            .eq('id', article.id)
        }
      }
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
  console.log(`Tagged with companies: ${tagged}`)
  console.log(`Failed: ${failed}`)
  if (isDryRun) {
    console.log('\n⚠️  DRY RUN - No changes were made')
    console.log('Run without --dry-run to apply changes')
  }
  console.log('==================================================\n')
}

main().catch(console.error)
