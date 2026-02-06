/**
 * Importance Scoring Algorithm v2
 *
 * Core principle: Personal relevance trumps general importance
 * - User's specific interests (keywords/companies) are weighted heavily
 * - Category alone is not enough - needs additional relevance signals
 * - Tier-1 companies only boost score if user has matching interests
 */

import type { NewsItem, Category } from '@/types/news'

// Tier 1 companies (AI Leaders) - only boost when user has related interests
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

// Company patterns for text-based matching (fallback for old articles without companies field)
// Synced with workers/ingest.ts and scripts/backfill-companies.ts
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

/**
 * Extract companies mentioned in text using pattern matching
 * Used as fallback when articles don't have companies field populated
 */
export function extractCompaniesFromText(text: string): string[] {
  const companies: string[] = []
  for (const [slug, pattern] of Object.entries(COMPANY_PATTERNS)) {
    if (pattern.test(text)) {
      companies.push(slug)
    }
  }
  return companies
}

// High-signal funding keywords (specific, not generic like "million")
const FUNDING_KEYWORDS = [
  'series a',
  'series b',
  'series c',
  'series d',
  'seed round',
  'pre-seed',
  'funding round',
  'raised $',
  'acquisition',
  'acquired by',
  'merger',
  'ipo',
  'unicorn status',
]

// High-signal product launch keywords (specific phrases)
const LAUNCH_KEYWORDS = [
  'launches',
  'launched today',
  'now available',
  'introduces',
  'unveils',
  'releasing',
  'general availability',
  'public beta',
  'open source',
]

interface UserInterests {
  categories: Category[]
  keywords: string[]
  companies: string[]
}

interface ImportanceFactors {
  categoryMatch: number     // 0-15 (baseline, not enough alone)
  keywordMatch: number      // 0-40 (highest weight - user's explicit interests)
  companyMatch: number      // 0-35 (high weight - user's pinned companies)
  tier1Boost: number        // 0-10 (only if user has related interests)
  eventSignal: number       // 0-10 (funding/launch - newsworthy events)
}

/**
 * Calculate importance score for a news item based on user interests
 *
 * Scoring philosophy:
 * - Personal relevance (keyword/company match) is required for high scores
 * - Category match alone caps at ~25 points (below threshold)
 * - Multiple matching factors create compounding effects
 *
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
    tier1Boost: 0,
    eventSignal: 0,
  }

  const content = `${newsItem.title} ${newsItem.summary}`.toLowerCase()

  // Get companies from article, or extract from text as fallback (for old articles)
  let newsCompanies = newsItem.companies || []
  const usedFallback = newsCompanies.length === 0 && userInterests.companies.length > 0
  if (usedFallback) {
    // Fallback: extract companies from text for old articles without companies field
    newsCompanies = extractCompaniesFromText(content)
  }

  // Track if user has specific interests defined
  const hasSpecificInterests =
    userInterests.keywords.length > 0 || userInterests.companies.length > 0

  // 1. Category Match (0-15 points) - baseline, not enough alone
  if (userInterests.categories.includes(newsItem.category)) {
    factors.categoryMatch = 15
  }

  // 2. Keyword Match (0-40 points) - PRIMARY relevance signal
  if (userInterests.keywords.length > 0) {
    const matchingKeywords = userInterests.keywords.filter(keyword =>
      content.includes(keyword.toLowerCase())
    )
    // Strong bonus for keyword matches - user explicitly cares about these
    factors.keywordMatch = Math.min(matchingKeywords.length * 20, 40)
  }

  // 3. Company Match (0-45 points) - user's pinned companies
  const matchingCompanies = newsCompanies.filter(company =>
    userInterests.companies.includes(company)
  )
  if (matchingCompanies.length > 0) {
    // 40 base + 5 for each additional company match (max 45)
    // Base of 40 ensures Category(15) + Company(40) = 55 passes threshold
    factors.companyMatch = Math.min(40 + (matchingCompanies.length - 1) * 5, 45)
  }

  // 4. Tier-1 Company Boost (0-10 points)
  // Always applies when category matches - Tier-1 companies = industry-important news
  // OpenAI, Anthropic, Google, etc. news is relevant to anyone in that category
  if (factors.categoryMatch > 0) {
    const hasTier1Company = newsCompanies.some(company =>
      TIER_1_COMPANIES.includes(company)
    )
    if (hasTier1Company) {
      factors.tier1Boost = 10
    }
  }

  // 5. Event Signal (0-10 points) - newsworthy events boost
  // Only meaningful if there's already some relevance
  if (factors.categoryMatch > 0) {
    const hasFundingKeyword = FUNDING_KEYWORDS.some(keyword =>
      content.includes(keyword)
    )
    const hasLaunchKeyword = LAUNCH_KEYWORDS.some(keyword =>
      content.includes(keyword)
    )
    if (hasFundingKeyword || hasLaunchKeyword) {
      factors.eventSignal = 10
    }
  }

  // Calculate base score
  let score = Object.values(factors).reduce((a, b) => a + b, 0)

  // 6. Cross-signal bonus (0-15 points)
  // Reward articles that match BOTH keyword AND company interests
  // This indicates high relevance - user cares about this topic AND this company
  if (factors.keywordMatch > 0 && factors.companyMatch > 0) {
    score += 15
  }

  // 7. Relevance multiplier
  // If user has specific interests but none matched, heavily penalize
  if (hasSpecificInterests && factors.keywordMatch === 0 && factors.companyMatch === 0) {
    score = Math.floor(score * 0.5) // 50% penalty
  }

  // 8. Multi-source boost (cluster size >= 3)
  // Reduced from 20% to 10% - shouldn't be main factor
  if (clusterSize >= 3) {
    score = Math.min(Math.floor(score * 1.1), 100)
  }

  return Math.min(score, 100)
}

/**
 * Filter news items by importance threshold
 * @param newsItems - Array of news items with scores
 * @param threshold - Minimum score to include (default 50)
 * @returns Filtered news items
 */
export function filterByImportance<T extends { score: number }>(
  newsItems: T[],
  threshold: number = 50
): T[] {
  return newsItems.filter(item => item.score >= threshold)
}

/**
 * Check if a news item matches user interests (pre-filter)
 *
 * This is a lightweight filter to reduce items before detailed scoring.
 * Rules:
 * - Must match category
 * - If user has keywords/companies: must match at least one
 * - If no specific interests: category match is enough (will be scored low anyway)
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
    // No specific interests - let all category matches through
    // They'll get low scores anyway (max 25 without personal relevance)
    return true
  }

  // Check keyword match
  const content = `${newsItem.title} ${newsItem.summary}`.toLowerCase()
  const hasKeywordMatch = userInterests.keywords.some(keyword =>
    content.includes(keyword.toLowerCase())
  )

  // Check company match - use companies field or fallback to text extraction
  let newsCompanies = newsItem.companies || []
  if (newsCompanies.length === 0 && userInterests.companies.length > 0) {
    // Fallback: extract companies from text for old articles
    newsCompanies = extractCompaniesFromText(content)
  }
  const hasCompanyMatch = newsCompanies.some(company =>
    userInterests.companies.includes(company)
  )

  return hasCompanyMatch || hasKeywordMatch
}
