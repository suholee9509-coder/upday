/**
 * Importance Scoring Algorithm
 * Calculates importance score (0-100) based on objective criteria
 */

import type { NewsItem, Category } from '@/types/news'

// Tier 1 companies (AI Leaders) - highest importance
const TIER_1_COMPANIES = [
  'openai',
  'anthropic',
  'google',
  'microsoft',
  'meta',
  'nvidia',
  'xai',
  'mistral',
]

// Funding/M&A keywords
const FUNDING_KEYWORDS = [
  'funding',
  'raised',
  'series a',
  'series b',
  'series c',
  'seed round',
  'acquisition',
  'acquired',
  'merger',
  'bought',
  'investment',
  'valuation',
  'unicorn',
  'billion',
  'million',
]

// Product launch keywords
const LAUNCH_KEYWORDS = [
  'launch',
  'launches',
  'launched',
  'release',
  'releases',
  'released',
  'announce',
  'announces',
  'announced',
  'unveil',
  'unveils',
  'unveiled',
  'introduce',
  'introduces',
  'introduced',
]

interface UserInterests {
  categories: Category[]
  keywords: string[]
  companies: string[]
}

interface ImportanceFactors {
  categoryMatch: number // 0-30
  keywordMatch: number // 0-25
  companyMatch: number // 0-20
  tier1Company: number // 0-15
  fundingOrMA: number // 0-10
  productLaunch: number // 0-10
}

/**
 * Calculate importance score for a news item based on user interests
 * @param newsItem - The news item to score
 * @param userInterests - User's interest settings
 * @param clusterSize - Number of related articles (for multi-source factor)
 * @returns Importance score (0-100)
 */
export function calculateImportanceScore(
  newsItem: NewsItem,
  userInterests: UserInterests,
  clusterSize: number = 1
): number {
  const factors: ImportanceFactors = {
    categoryMatch: 0,
    keywordMatch: 0,
    companyMatch: 0,
    tier1Company: 0,
    fundingOrMA: 0,
    productLaunch: 0,
  }

  const content = `${newsItem.title} ${newsItem.summary}`.toLowerCase()

  // 1. Category Match (0-30 points)
  if (userInterests.categories.includes(newsItem.category)) {
    factors.categoryMatch = 30
  }

  // 2. Keyword Match (0-25 points)
  if (userInterests.keywords.length > 0) {
    const matchingKeywords = userInterests.keywords.filter(keyword =>
      content.includes(keyword.toLowerCase())
    )
    // Score based on number of matching keywords (max 25)
    factors.keywordMatch = Math.min(matchingKeywords.length * 10, 25)
  }

  // 3. Company Match (0-20 points)
  const newsCompanies = newsItem.companies || []
  const matchingCompanies = newsCompanies.filter(company =>
    userInterests.companies.includes(company)
  )
  if (matchingCompanies.length > 0) {
    factors.companyMatch = 20
  }

  // 4. Tier-1 Company Mention (0-15 points)
  const hasTier1Company = newsCompanies.some(company =>
    TIER_1_COMPANIES.includes(company)
  )
  if (hasTier1Company) {
    factors.tier1Company = 15
  }

  // 5. Funding/M&A (0-10 points)
  const hasFundingKeyword = FUNDING_KEYWORDS.some(keyword =>
    content.includes(keyword)
  )
  if (hasFundingKeyword) {
    factors.fundingOrMA = 10
  }

  // 6. Product Launch (0-10 points)
  const hasLaunchKeyword = LAUNCH_KEYWORDS.some(keyword =>
    content.includes(keyword)
  )
  if (hasLaunchKeyword) {
    factors.productLaunch = 10
  }

  // Base score (sum of all factors)
  let score =
    factors.categoryMatch +
    factors.keywordMatch +
    factors.companyMatch +
    factors.tier1Company +
    factors.fundingOrMA +
    factors.productLaunch

  // 7. Multi-source boost (cluster size >= 3)
  if (clusterSize >= 3) {
    score = Math.min(score * 1.2, 100) // 20% boost, capped at 100
  }

  return Math.round(Math.min(score, 100))
}

/**
 * Filter news items by importance threshold
 * @param newsItems - Array of news items with scores
 * @param threshold - Minimum score to include (default 40)
 * @returns Filtered news items
 */
export function filterByImportance<T extends { score: number }>(
  newsItems: T[],
  threshold: number = 40
): T[] {
  return newsItems.filter(item => item.score >= threshold)
}

/**
 * Check if a news item matches user interests (basic filter)
 * Used for initial filtering before importance scoring
 */
export function matchesUserInterests(
  newsItem: NewsItem,
  userInterests: UserInterests
): boolean {
  // Must match at least one selected category
  if (!userInterests.categories.includes(newsItem.category)) {
    return false
  }

  // If user has specific companies/keywords, at least one must match
  const hasSpecificInterests =
    userInterests.companies.length > 0 || userInterests.keywords.length > 0

  if (!hasSpecificInterests) {
    return true // Category match is enough if no specific interests
  }

  // Check company match
  const newsCompanies = newsItem.companies || []
  const hasCompanyMatch = newsCompanies.some(company =>
    userInterests.companies.includes(company)
  )

  // Check keyword match
  const content = `${newsItem.title} ${newsItem.summary}`.toLowerCase()
  const hasKeywordMatch = userInterests.keywords.some(keyword =>
    content.includes(keyword.toLowerCase())
  )

  return hasCompanyMatch || hasKeywordMatch
}
