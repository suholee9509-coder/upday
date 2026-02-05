/**
 * News Clustering Algorithm
 * Groups news articles about the same event
 */

import type { NewsItem } from '@/types/news'

export interface NewsCluster {
  id: string // ID of the representative article
  representative: NewsItem
  related: NewsItem[]
  clusterSize: number // Total articles in cluster (1 + related.length)
}

/**
 * Calculate similarity score between two news items (0-1)
 * Based on title similarity, category, companies, and time proximity
 */
function calculateSimilarity(item1: NewsItem, item2: NewsItem): number {
  let score = 0

  // 1. Category match (20 points)
  if (item1.category === item2.category) {
    score += 20
  }

  // 2. Company overlap (30 points)
  const companies1 = new Set(item1.companies || [])
  const companies2 = new Set(item2.companies || [])
  const commonCompanies = [...companies1].filter(c => companies2.has(c))
  if (commonCompanies.length > 0) {
    score += 30
  }

  // 3. Title word overlap (40 points)
  const words1 = extractKeywords(item1.title)
  const words2 = extractKeywords(item2.title)
  const commonWords = words1.filter(w => words2.includes(w))
  const titleSimilarity = commonWords.length / Math.max(words1.length, words2.length)
  score += titleSimilarity * 40

  // 4. Time proximity (10 points) - within 48 hours
  const time1 = new Date(item1.publishedAt).getTime()
  const time2 = new Date(item2.publishedAt).getTime()
  const hoursDiff = Math.abs(time1 - time2) / (1000 * 60 * 60)
  if (hoursDiff <= 48) {
    score += 10 * (1 - hoursDiff / 48)
  }

  return score / 100 // Normalize to 0-1
}

// Cache for extracted keywords to avoid repeated computation
const keywordCache = new Map<string, string[]>()

/**
 * Extract important keywords from text (remove stop words)
 * Uses caching for performance
 */
function extractKeywords(text: string): string[] {
  // Check cache first
  const cached = keywordCache.get(text)
  if (cached) return cached

  const stopWords = new Set([
    'a',
    'an',
    'the',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'to',
    'of',
    'in',
    'for',
    'on',
    'with',
    'at',
    'by',
    'from',
    'as',
    'into',
    'like',
    'through',
    'after',
    'over',
    'between',
    'out',
    'against',
    'during',
    'without',
    'before',
    'under',
    'around',
    'among',
  ])

  const keywords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))

  // Cache result (limit cache size to prevent memory issues)
  if (keywordCache.size > 2000) {
    keywordCache.clear()
  }
  keywordCache.set(text, keywords)

  return keywords
}

/**
 * Cluster news items into groups of related articles
 * @param newsItems - Array of news items to cluster
 * @param similarityThreshold - Minimum similarity to group together (default 0.4)
 * @returns Array of news clusters
 */
export function clusterNews(
  newsItems: NewsItem[],
  similarityThreshold: number = 0.4
): NewsCluster[] {
  if (newsItems.length === 0) return []

  // Sort by published date (most recent first)
  const sortedItems = [...newsItems].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const clusters: NewsCluster[] = []
  const assigned = new Set<string>()

  for (const item of sortedItems) {
    if (assigned.has(item.id)) continue

    // Create new cluster with this item as representative
    const cluster: NewsCluster = {
      id: item.id,
      representative: item,
      related: [],
      clusterSize: 1,
    }

    assigned.add(item.id)

    // Find similar items
    for (const otherItem of sortedItems) {
      if (assigned.has(otherItem.id)) continue

      const similarity = calculateSimilarity(item, otherItem)
      if (similarity >= similarityThreshold) {
        cluster.related.push(otherItem)
        assigned.add(otherItem.id)
      }
    }

    cluster.clusterSize = 1 + cluster.related.length
    clusters.push(cluster)
  }

  return clusters
}

/**
 * Get all news items from clusters (flattened)
 */
export function flattenClusters(clusters: NewsCluster[]): NewsItem[] {
  return clusters.flatMap(cluster => [cluster.representative, ...cluster.related])
}

/**
 * Find cluster containing a specific news item
 */
export function findClusterByItemId(
  clusters: NewsCluster[],
  itemId: string
): NewsCluster | undefined {
  return clusters.find(
    cluster =>
      cluster.representative.id === itemId ||
      cluster.related.some(item => item.id === itemId)
  )
}
