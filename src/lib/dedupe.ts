/**
 * Deduplication Module
 * Removes duplicate articles based on URL and title similarity
 * Prevents unnecessary AI processing for existing articles (cost optimization)
 */

import { supabase } from './db'
import type { RawArticle } from './crawl'

export interface DedupeStats {
  input: number
  afterUrlFilter: number
  afterTitleFilter: number
  urlDuplicates: number
  titleDuplicates: number
  aiCallsSaved: number
}

/**
 * Normalize URL by removing tracking parameters and fragments
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)

    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'source', 'fbclid', 'gclid', 'mc_cid', 'mc_eid'
    ]
    trackingParams.forEach(param => parsed.searchParams.delete(param))

    // Remove fragment
    parsed.hash = ''

    // Normalize trailing slash
    let normalizedPath = parsed.pathname
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1)
    }
    parsed.pathname = normalizedPath

    return parsed.toString()
  } catch {
    return url // Return original if parsing fails
  }
}

/**
 * Calculate Jaccard similarity between two strings (word-based)
 */
function jaccardSimilarity(a: string, b: string): number {
  const aWords = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  const bWords = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2))

  if (aWords.size === 0 || bWords.size === 0) return 0

  const intersection = [...aWords].filter(w => bWords.has(w)).length
  const union = new Set([...aWords, ...bWords]).size

  return intersection / union
}

/**
 * Calculate normalized Levenshtein distance between two strings
 */
function levenshteinSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()

  if (aLower === bLower) return 1

  const maxLen = Math.max(aLower.length, bLower.length)
  if (maxLen === 0) return 1

  // Build distance matrix
  const matrix: number[][] = []
  for (let i = 0; i <= aLower.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= bLower.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= aLower.length; i++) {
    for (let j = 1; j <= bLower.length; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  const distance = matrix[aLower.length][bLower.length]
  return 1 - distance / maxLen
}

/**
 * Combined similarity score using both Jaccard and Levenshtein
 */
function similarityScore(a: string, b: string): number {
  const jaccard = jaccardSimilarity(a, b)
  const levenshtein = levenshteinSimilarity(a, b)

  // Weight: 60% Jaccard (word overlap), 40% Levenshtein (character similarity)
  return jaccard * 0.6 + levenshtein * 0.4
}

// Similarity threshold for considering titles as duplicates
const TITLE_SIMILARITY_THRESHOLD = 0.75

/**
 * Remove articles that already exist in the database (by URL)
 * Uses normalized URLs for comparison
 */
async function filterExistingUrls(articles: RawArticle[]): Promise<{ filtered: RawArticle[]; duplicateCount: number }> {
  if (!supabase || articles.length === 0) {
    return { filtered: articles, duplicateCount: 0 }
  }

  // Normalize URLs for both query and comparison
  const urlMap = new Map<string, RawArticle>()
  for (const article of articles) {
    const normalized = normalizeUrl(article.sourceUrl)
    // Keep the first occurrence of each normalized URL
    if (!urlMap.has(normalized)) {
      urlMap.set(normalized, article)
    }
  }

  const normalizedUrls = Array.from(urlMap.keys())
  const originalUrls = articles.map(a => a.sourceUrl)

  // Query in batches to avoid URL length limits
  const batchSize = 50
  const existingUrls = new Set<string>()

  // Check both normalized and original URLs
  const allUrlsToCheck = [...new Set([...normalizedUrls, ...originalUrls])]

  for (let i = 0; i < allUrlsToCheck.length; i += batchSize) {
    const batch = allUrlsToCheck.slice(i, i + batchSize)
    const { data } = await supabase
      .from('news_items')
      .select('source_url')
      .in('source_url', batch)

    if (data) {
      data.forEach(row => {
        existingUrls.add(row.source_url)
        existingUrls.add(normalizeUrl(row.source_url))
      })
    }
  }

  const filtered = articles.filter(a => {
    const normalized = normalizeUrl(a.sourceUrl)
    return !existingUrls.has(a.sourceUrl) && !existingUrls.has(normalized)
  })

  const duplicateCount = articles.length - filtered.length
  console.log(`[DEDUPE] URL filter: ${duplicateCount} duplicates found (${filtered.length} remaining)`)

  return { filtered, duplicateCount }
}

/**
 * Remove articles with similar titles within the batch
 */
function filterSimilarTitles(articles: RawArticle[]): { filtered: RawArticle[]; duplicateCount: number } {
  const unique: RawArticle[] = []

  for (const article of articles) {
    const isDuplicate = unique.some(
      existing => similarityScore(existing.title, article.title) > TITLE_SIMILARITY_THRESHOLD
    )

    if (!isDuplicate) {
      unique.push(article)
    }
  }

  const duplicateCount = articles.length - unique.length
  console.log(`[DEDUPE] Title filter: ${duplicateCount} similar titles found (${unique.length} remaining)`)

  return { filtered: unique, duplicateCount }
}

/**
 * Main deduplication function
 * 1. Remove articles with URLs already in database
 * 2. Remove articles with similar titles within the batch
 *
 * Returns unique articles and stats (AI calls saved = total duplicates)
 */
export async function deduplicateArticles(articles: RawArticle[]): Promise<RawArticle[]> {
  if (articles.length === 0) return []

  // Step 1: Filter by existing URLs in database
  const { filtered: afterUrlFilter, duplicateCount: urlDupes } = await filterExistingUrls(articles)

  // Step 2: Filter by title similarity within the batch
  const { filtered: afterTitleFilter, duplicateCount: titleDupes } = filterSimilarTitles(afterUrlFilter)

  const stats: DedupeStats = {
    input: articles.length,
    afterUrlFilter: afterUrlFilter.length,
    afterTitleFilter: afterTitleFilter.length,
    urlDuplicates: urlDupes,
    titleDuplicates: titleDupes,
    aiCallsSaved: urlDupes + titleDupes,
  }

  console.log(`[DEDUPE] ========================================`)
  console.log(`[DEDUPE] Input articles: ${stats.input}`)
  console.log(`[DEDUPE] URL duplicates skipped: ${stats.urlDuplicates}`)
  console.log(`[DEDUPE] Title duplicates skipped: ${stats.titleDuplicates}`)
  console.log(`[DEDUPE] Final unique articles: ${stats.afterTitleFilter}`)
  console.log(`[DEDUPE] AI API calls saved: ${stats.aiCallsSaved}`)
  console.log(`[DEDUPE] ========================================`)

  return afterTitleFilter
}

/**
 * Get deduplication stats without filtering (for monitoring)
 */
export async function getDedupeStats(articles: RawArticle[]): Promise<DedupeStats> {
  if (articles.length === 0) {
    return {
      input: 0,
      afterUrlFilter: 0,
      afterTitleFilter: 0,
      urlDuplicates: 0,
      titleDuplicates: 0,
      aiCallsSaved: 0,
    }
  }

  const { filtered: afterUrlFilter, duplicateCount: urlDupes } = await filterExistingUrls(articles)
  const { filtered: afterTitleFilter, duplicateCount: titleDupes } = filterSimilarTitles(afterUrlFilter)

  return {
    input: articles.length,
    afterUrlFilter: afterUrlFilter.length,
    afterTitleFilter: afterTitleFilter.length,
    urlDuplicates: urlDupes,
    titleDuplicates: titleDupes,
    aiCallsSaved: urlDupes + titleDupes,
  }
}

/**
 * Check if a single article is a duplicate
 */
export async function isArticleDuplicate(article: RawArticle): Promise<boolean> {
  if (!supabase) return false

  // Check URL
  const { data: urlMatch } = await supabase
    .from('news_items')
    .select('id')
    .eq('source_url', article.sourceUrl)
    .limit(1)

  if (urlMatch && urlMatch.length > 0) {
    return true
  }

  // Check recent titles for similarity (last 100 articles)
  const { data: recentTitles } = await supabase
    .from('news_items')
    .select('title')
    .order('created_at', { ascending: false })
    .limit(100)

  if (recentTitles) {
    for (const row of recentTitles) {
      if (similarityScore(row.title, article.title) > TITLE_SIMILARITY_THRESHOLD) {
        return true
      }
    }
  }

  return false
}
