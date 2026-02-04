/**
 * Company Relevance Scoring
 *
 * Calculates relevance score for articles based on company mentions.
 * Used to filter articles on the Companies page.
 */

import type { NewsItem } from '@/types/news'

const RELEVANCE_THRESHOLD = 50

// Action keywords that indicate high relevance
const ACTION_KEYWORDS = [
  'announces', 'announced', 'launches', 'launched', 'unveils', 'unveiled',
  'releases', 'released', 'introduces', 'introduced', 'acquires', 'acquired',
  'raises', 'raised', 'secures', 'secured', 'partners', 'partnered',
  'expands', 'expanded', 'opens', 'opened', 'hires', 'hired',
]

/**
 * Calculate relevance score for a company in an article
 *
 * Scoring:
 * - Title contains company: +50
 * - First sentence contains company: +30
 * - Number of mentions (×10, max 30): up to +30
 * - Action keyword with company: +20
 *
 * Max possible: 130
 */
export function calculateRelevanceScore(
  article: Pick<NewsItem, 'title' | 'summary'>,
  companySlug: string
): number {
  const title = article.title.toLowerCase()
  const summary = article.summary.toLowerCase()
  const company = companySlug.toLowerCase()

  // Handle special cases for company name matching
  const companyPattern = getCompanyPattern(companySlug)

  let score = 0

  // Title contains company (+50 points)
  if (companyPattern.test(title)) {
    score += 50
  }

  // First sentence contains company (+30 points)
  const firstSentence = summary.split(/[.!?]/)[0] || ''
  if (companyPattern.test(firstSentence)) {
    score += 30
  }

  // Count mentions (×10, max 30 points)
  const fullText = `${title} ${summary}`
  const matches = fullText.match(companyPattern) || []
  score += Math.min(matches.length * 10, 30)

  // Action keyword with company (+20 points)
  const hasActionKeyword = ACTION_KEYWORDS.some(action => {
    const actionPattern = new RegExp(`${company}\\s+${action}|${action}\\s+${company}`, 'i')
    return actionPattern.test(fullText)
  })
  if (hasActionKeyword) {
    score += 20
  }

  return score
}

/**
 * Get regex pattern for company name matching
 * Handles special cases like "OpenAI" matching "Open AI"
 */
function getCompanyPattern(companySlug: string): RegExp {
  const patterns: Record<string, RegExp> = {
    'openai': /\bopen\s?ai\b/gi,
    'xai': /\bx\.?ai\b/gi,
    'meta': /\bmeta\b(?!\s*data)/gi,
    'linear': /\blinear\b(?!\s*regression)/gi,
    'cursor': /\bcursor\b(?!\s*position)/gi,
    'apple': /\bapple\b(?!\s*(?:pie|cider|tree))/gi,
    'stripe': /\bstripe\b(?!\s*(?:pattern|shirt))/gi,
    'slack': /\bslack\b(?!\s*(?:off|time))/gi,
  }

  return patterns[companySlug] || new RegExp(`\\b${companySlug}\\b`, 'gi')
}

/**
 * Check if article is relevant enough for a company
 */
export function isRelevantForCompany(
  article: Pick<NewsItem, 'title' | 'summary'>,
  companySlug: string
): boolean {
  return calculateRelevanceScore(article, companySlug) >= RELEVANCE_THRESHOLD
}

/**
 * Filter articles by relevance for a specific company
 */
export function filterByRelevance(
  articles: NewsItem[],
  companySlug: string
): NewsItem[] {
  return articles.filter(article => isRelevantForCompany(article, companySlug))
}

/**
 * Get relevance scores for all companies in an article
 */
export function getArticleCompanyScores(
  article: Pick<NewsItem, 'title' | 'summary' | 'companies'>
): Record<string, number> {
  const scores: Record<string, number> = {}

  for (const company of article.companies || []) {
    scores[company] = calculateRelevanceScore(article, company)
  }

  return scores
}
