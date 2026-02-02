/**
 * Deduplication Module
 * Removes duplicate articles based on URL and title similarity
 */

import { supabase } from './db'
import type { RawArticle } from './crawl'

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
 */
async function filterExistingUrls(articles: RawArticle[]): Promise<RawArticle[]> {
  if (!supabase || articles.length === 0) return articles

  const urls = articles.map(a => a.sourceUrl)

  // Query in batches to avoid URL length limits
  const batchSize = 50
  const existingUrls = new Set<string>()

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const { data } = await supabase
      .from('news_items')
      .select('source_url')
      .in('source_url', batch)

    if (data) {
      data.forEach(row => existingUrls.add(row.source_url))
    }
  }

  const filtered = articles.filter(a => !existingUrls.has(a.sourceUrl))
  console.log(`Filtered ${articles.length - filtered.length} articles by existing URL`)

  return filtered
}

/**
 * Remove articles with similar titles within the batch
 */
function filterSimilarTitles(articles: RawArticle[]): RawArticle[] {
  const unique: RawArticle[] = []

  for (const article of articles) {
    const isDuplicate = unique.some(
      existing => similarityScore(existing.title, article.title) > TITLE_SIMILARITY_THRESHOLD
    )

    if (!isDuplicate) {
      unique.push(article)
    }
  }

  console.log(`Filtered ${articles.length - unique.length} articles by title similarity`)
  return unique
}

/**
 * Main deduplication function
 * 1. Remove articles with URLs already in database
 * 2. Remove articles with similar titles within the batch
 */
export async function deduplicateArticles(articles: RawArticle[]): Promise<RawArticle[]> {
  if (articles.length === 0) return []

  // Step 1: Filter by existing URLs in database
  const afterUrlFilter = await filterExistingUrls(articles)

  // Step 2: Filter by title similarity within the batch
  const afterTitleFilter = filterSimilarTitles(afterUrlFilter)

  console.log(
    `Deduplication: ${articles.length} → ${afterTitleFilter.length} articles`
  )

  return afterTitleFilter
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
