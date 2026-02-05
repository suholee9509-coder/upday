#!/usr/bin/env npx tsx
/**
 * Backfill Korean translations for existing articles
 * Run: npx tsx scripts/backfill-korean.ts
 * Dry run: npx tsx scripts/backfill-korean.ts --dry-run
 * Limit: npx tsx scripts/backfill-korean.ts --limit=100
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const openaiKey = process.env.VITE_OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

if (!openaiKey) {
  console.error('Missing VITE_OPENAI_API_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const openai = new OpenAI({ apiKey: openaiKey })

const isDryRun = process.argv.includes('--dry-run')
const limitArg = process.argv.find(arg => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 1000

async function translateToKorean(title: string, summary: string): Promise<{ titleKo: string; summaryKo: string }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional Korean translator for a tech news platform. Translate the given title and summary to natural, fluent Korean.
Rules:
- Maintain technical terms in English when commonly used (e.g., AI, API, GPT)
- Keep proper nouns (company names, product names) in original form
- Use formal but accessible Korean (합니다체)
- Preserve the original meaning and tone
- Return JSON format: {"titleKo": "...", "summaryKo": "..."}`
      },
      {
        role: 'user',
        content: `Title: ${title}\n\nSummary: ${summary}`
      }
    ],
    max_tokens: 500,
    temperature: 0.3,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No translation response')

  const parsed = JSON.parse(content)
  return {
    titleKo: parsed.titleKo || title,
    summaryKo: parsed.summaryKo || summary
  }
}

async function backfillKorean() {
  console.log(`\n🇰🇷 Backfill Korean Translations ${isDryRun ? '(DRY RUN)' : ''}\n`)
  console.log('='.repeat(60))
  console.log(`Limit: ${limit} articles\n`)

  // Find articles without Korean translations
  const { data: articles, error } = await supabase
    .from('news_items')
    .select('id, title, summary, source')
    .is('title_ko', null)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching articles:', error)
    return
  }

  console.log(`Found ${articles?.length || 0} articles without Korean translations\n`)

  if (!articles || articles.length === 0) {
    console.log('Nothing to backfill!')
    return
  }

  let updated = 0
  let failed = 0
  const batchSize = 5
  const delayMs = 1000

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(articles.length / batchSize)

    console.log(`\nBatch ${batchNum}/${totalBatches}`)

    const results = await Promise.allSettled(
      batch.map(async (article) => {
        try {
          console.log(`  [${article.source}] ${article.title.substring(0, 40)}...`)

          const { titleKo, summaryKo } = await translateToKorean(article.title, article.summary)

          console.log(`    → ${titleKo.substring(0, 40)}...`)

          if (!isDryRun) {
            const { error: updateError } = await supabase
              .from('news_items')
              .update({ title_ko: titleKo, summary_ko: summaryKo })
              .eq('id', article.id)

            if (updateError) {
              throw new Error(updateError.message)
            }
          }

          return { success: true }
        } catch (error) {
          console.log(`    ✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
          return { success: false }
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        updated++
      } else {
        failed++
      }
    }

    // Rate limiting between batches
    if (i + batchSize < articles.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✅ Summary:`)
  console.log(`   ${isDryRun ? 'Would translate' : 'Translated'}: ${updated}`)
  console.log(`   Failed: ${failed}`)

  // Estimate cost
  const estimatedTokens = updated * 170 // ~170 tokens per article (input + output)
  const estimatedCost = (estimatedTokens / 1000000) * (0.15 + 0.60) // gpt-4o-mini pricing
  console.log(`   Estimated cost: $${estimatedCost.toFixed(4)}`)

  if (isDryRun) {
    console.log('\nRun without --dry-run to apply changes.')
  }
}

backfillKorean().catch(console.error)
