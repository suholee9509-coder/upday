/**
 * News Ingestion Pipeline
 * Orchestrates crawling, deduplication, cleaning, AI processing, and storage
 */

import { crawlAllSources, type RawArticle } from './crawl'
import { deduplicateArticles } from './dedupe'
import { cleanArticleBody, cleanTitle, isValidContent } from './clean'
import { processArticleAI, isAIConfigured, getAIProvider } from './ai'
import { supabase } from './db'
import type { Category } from '@/types/news'

export interface IngestionResult {
  crawled: number
  deduplicated: number
  valid: number
  stored: number
  aiProcessed: number
  aiProvider: string
  errors: string[]
}

export interface ProcessedArticle {
  title: string
  summary: string
  body: string
  category: Category
  source: string
  source_url: string
  published_at: string
}

/**
 * Generate a simple summary from the article body (fallback when AI unavailable)
 */
function generateSimpleSummary(title: string, body: string): string {
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 20)

  if (sentences.length === 0) {
    return title
  }

  let summary = ''
  for (const sentence of sentences.slice(0, 3)) {
    const trimmed = sentence.trim()
    if (summary.length + trimmed.length > 200) break
    summary += (summary ? '. ' : '') + trimmed
  }

  return summary + '.'
}

/**
 * Classify article into a category (fallback when AI unavailable)
 */
function classifySimple(
  title: string,
  body: string,
  suggestedCategories: Category[]
): Category {
  if (suggestedCategories.length > 0) {
    return suggestedCategories[0]
  }

  const text = (title + ' ' + body).toLowerCase()

  const categoryKeywords: Record<Category, string[]> = {
    ai: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'claude', 'chatbot', 'neural'],
    startup: ['startup', 'funding', 'series a', 'series b', 'ipo', 'acquisition', 'unicorn', 'venture'],
    science: ['research', 'study', 'scientists', 'discovery', 'experiment', 'medical', 'biology', 'physics'],
    design: ['design', 'ui', 'ux', 'figma', 'adobe', 'creative', 'visual', 'interface'],
    space: ['space', 'nasa', 'spacex', 'rocket', 'mars', 'moon', 'satellite', 'orbit', 'astronaut'],
    dev: ['developer', 'programming', 'code', 'github', 'javascript', 'python', 'react', 'api', 'framework'],
  }

  let bestCategory: Category = 'dev'
  let bestScore = 0

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter(kw => text.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestCategory = category as Category
    }
  }

  return bestCategory
}

/**
 * Process a single article with AI (or fallback to simple processing)
 */
async function processArticleWithAI(raw: RawArticle): Promise<ProcessedArticle | null> {
  const title = cleanTitle(raw.title)
  const body = cleanArticleBody(raw.body)

  if (!isValidContent(title, body)) {
    return null
  }

  let summary: string
  let category: Category

  if (isAIConfigured()) {
    try {
      const aiResult = await processArticleAI(title, body)
      summary = aiResult.summary
      category = aiResult.category
    } catch (error) {
      console.warn('AI processing failed, using fallback:', error)
      summary = generateSimpleSummary(title, body)
      category = classifySimple(title, body, raw.suggestedCategories)
    }
  } else {
    summary = generateSimpleSummary(title, body)
    category = classifySimple(title, body, raw.suggestedCategories)
  }

  return {
    title,
    summary,
    body,
    category,
    source: raw.source,
    source_url: raw.sourceUrl,
    published_at: raw.publishedAt,
  }
}

/**
 * Process article without AI (synchronous fallback)
 */
function processArticleSimple(raw: RawArticle): ProcessedArticle | null {
  const title = cleanTitle(raw.title)
  const body = cleanArticleBody(raw.body)

  if (!isValidContent(title, body)) {
    return null
  }

  return {
    title,
    summary: generateSimpleSummary(title, body),
    body,
    category: classifySimple(title, body, raw.suggestedCategories),
    source: raw.source,
    source_url: raw.sourceUrl,
    published_at: raw.publishedAt,
  }
}

/**
 * Store processed articles in the database
 */
async function storeArticles(articles: ProcessedArticle[]): Promise<number> {
  if (!supabase || articles.length === 0) return 0

  let stored = 0
  const batchSize = 20

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize)

    const { error } = await supabase
      .from('news_items')
      .upsert(batch, {
        onConflict: 'source_url',
        ignoreDuplicates: true,
      })

    if (error) {
      console.error(`Error storing batch ${i / batchSize + 1}:`, error.message)
    } else {
      stored += batch.length
    }
  }

  return stored
}

/**
 * Run the full ingestion pipeline with AI processing
 */
export async function runIngestionPipeline(useAI: boolean = true): Promise<IngestionResult> {
  const result: IngestionResult = {
    crawled: 0,
    deduplicated: 0,
    valid: 0,
    stored: 0,
    aiProcessed: 0,
    aiProvider: getAIProvider(),
    errors: [],
  }

  try {
    console.log('Starting ingestion pipeline...')
    console.log(`AI Provider: ${result.aiProvider}`)

    // Step 1: Crawl all sources
    const rawArticles = await crawlAllSources()
    result.crawled = rawArticles.length
    console.log(`Crawled ${result.crawled} articles`)

    if (rawArticles.length === 0) {
      result.errors.push('No articles crawled from any source')
      return result
    }

    // Step 2: Deduplicate
    const uniqueArticles = await deduplicateArticles(rawArticles)
    result.deduplicated = uniqueArticles.length
    console.log(`${result.deduplicated} unique articles after deduplication`)

    if (uniqueArticles.length === 0) {
      console.log('No new unique articles to process')
      return result
    }

    // Step 3: Process (clean, summarize, classify)
    const processedArticles: ProcessedArticle[] = []
    const shouldUseAI = useAI && isAIConfigured()

    if (shouldUseAI) {
      // Process with AI (in batches to respect rate limits)
      const batchSize = 3
      for (let i = 0; i < uniqueArticles.length; i += batchSize) {
        const batch = uniqueArticles.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(raw => processArticleWithAI(raw))
        )

        for (const processed of batchResults) {
          if (processed) {
            processedArticles.push(processed)
            result.aiProcessed++
          }
        }

        // Rate limit delay between batches
        if (i + batchSize < uniqueArticles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    } else {
      // Process without AI (faster, synchronous)
      for (const raw of uniqueArticles) {
        const processed = processArticleSimple(raw)
        if (processed) {
          processedArticles.push(processed)
        }
      }
    }

    result.valid = processedArticles.length
    console.log(`${result.valid} articles passed validation`)
    if (shouldUseAI) {
      console.log(`${result.aiProcessed} articles processed with AI`)
    }

    // Step 4: Store in database
    result.stored = await storeArticles(processedArticles)
    console.log(`Stored ${result.stored} articles`)

    console.log('Ingestion pipeline completed successfully')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(message)
    console.error('Ingestion pipeline failed:', message)
  }

  return result
}

/**
 * Run pipeline without AI (faster, for testing)
 */
export async function runIngestionPipelineSimple(): Promise<IngestionResult> {
  return runIngestionPipeline(false)
}

/**
 * Run pipeline for a specific category only
 */
export async function runCategoryIngestion(_category: Category): Promise<IngestionResult> {
  // TODO: Implement category-specific crawling
  return runIngestionPipeline()
}
