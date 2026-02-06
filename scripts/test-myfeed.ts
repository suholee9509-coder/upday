#!/usr/bin/env npx tsx
/**
 * My Feed Algorithm Test
 * Simulates user onboarding and tests article filtering
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const url = process.env.VITE_SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(url, key)

// Tier 1 companies
const TIER_1_COMPANIES = ['openai', 'anthropic', 'google', 'microsoft', 'meta', 'nvidia', 'xai', 'mistral']

// Company patterns for text extraction
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
  'cursor': /\bcursor\b(?!\s*position)/i,
  'github': /\bgithub\b/i,
  'apple': /\bapple\b(?!\s*(?:pie|cider|tree))/i,
  'amazon': /\bamazon\b/i,
  'stripe': /\bstripe\b(?!\s*(?:pattern|shirt))/i,
}

// Funding/Launch keywords
const FUNDING_KEYWORDS = ['series a', 'series b', 'series c', 'funding round', 'raised $', 'acquisition', 'acquired by', 'ipo']
const LAUNCH_KEYWORDS = ['launches', 'launched today', 'now available', 'introduces', 'unveils', 'general availability', 'open source']

function extractCompaniesFromText(text: string): string[] {
  const companies: string[] = []
  for (const [slug, pattern] of Object.entries(COMPANY_PATTERNS)) {
    if (pattern.test(text)) {
      companies.push(slug)
    }
  }
  return companies
}

interface UserProfile {
  name: string
  categories: string[]
  keywords: string[]
  companies: string[]
}

// Test user profiles representing different onboarding choices
const TEST_PROFILES: UserProfile[] = [
  {
    name: "AI Engineer (Keywords+Companies)",
    categories: ['ai', 'dev'],
    keywords: ['LLM', 'GPT', 'transformer'],
    companies: ['openai', 'anthropic']
  },
  {
    name: "Startup Watcher (Keywords only)",
    categories: ['startups', 'product'],
    keywords: ['funding', 'YC', 'seed', 'Series A'],
    companies: []
  },
  {
    name: "Vercel Fan (Companies only)",
    categories: ['dev', 'ai'],
    keywords: [],
    companies: ['vercel', 'supabase', 'cloudflare']
  },
  {
    name: "AI Researcher (Keywords+Companies)",
    categories: ['ai', 'research'],
    keywords: ['model', 'benchmark', 'training'],
    companies: ['openai', 'anthropic', 'google', 'meta']
  },
  {
    name: "OpenAI Tracker (Companies only)",
    categories: ['ai', 'dev'],
    keywords: [],
    companies: ['openai', 'anthropic']
  },
  {
    name: "Category Only (No specific)",
    categories: ['ai', 'startups'],
    keywords: [],
    companies: []
  },
  {
    name: "Product + AI (Category Only)",
    categories: ['product', 'ai'],
    keywords: [],
    companies: []
  }
]

function calculateScore(
  item: { title: string; summary: string; category: string; companies: string[] | null },
  profile: UserProfile
): { score: number; factors: Record<string, number> } {
  const factors: Record<string, number> = {
    categoryMatch: 0,
    keywordMatch: 0,
    companyMatch: 0,
    tier1Boost: 0,
    eventSignal: 0,
    crossSignal: 0,
  }

  const content = `${item.title} ${item.summary}`.toLowerCase()

  // Get companies from article or extract from text
  let newsCompanies = item.companies || []
  if (newsCompanies.length === 0 && profile.companies.length > 0) {
    newsCompanies = extractCompaniesFromText(content)
  }

  // 1. Category Match (15 pts)
  if (profile.categories.includes(item.category)) {
    factors.categoryMatch = 15
  }

  // 2. Keyword Match (20 each, max 40)
  if (profile.keywords.length > 0) {
    const matchingKeywords = profile.keywords.filter(kw => content.includes(kw.toLowerCase()))
    factors.keywordMatch = Math.min(matchingKeywords.length * 20, 40)
  }

  // 3. Company Match (30 base + 5 per additional, max 35)
  const matchingCompanies = newsCompanies.filter(c => profile.companies.includes(c))
  if (matchingCompanies.length > 0) {
    factors.companyMatch = Math.min(30 + (matchingCompanies.length - 1) * 5, 35)
  }

  // 4. Tier-1 Boost (10 pts) - always applies when category matches
  // Tier-1 companies = industry-important news for anyone in that category
  if (factors.categoryMatch > 0) {
    const hasTier1 = newsCompanies.some(c => TIER_1_COMPANIES.includes(c))
    if (hasTier1) {
      factors.tier1Boost = 10
    }
  }

  // 5. Event Signal (10 pts)
  if (factors.categoryMatch > 0) {
    const hasFunding = FUNDING_KEYWORDS.some(kw => content.includes(kw))
    const hasLaunch = LAUNCH_KEYWORDS.some(kw => content.includes(kw))
    if (hasFunding || hasLaunch) {
      factors.eventSignal = 10
    }
  }

  // 6. Cross-signal bonus (15 pts) - both keyword AND company match
  if (factors.keywordMatch > 0 && factors.companyMatch > 0) {
    factors.crossSignal = 15
  }

  let score = Object.values(factors).reduce((a, b) => a + b, 0)

  // Penalty for no specific interest match
  const hasSpecificInterests = profile.keywords.length > 0 || profile.companies.length > 0
  if (hasSpecificInterests && factors.keywordMatch === 0 && factors.companyMatch === 0) {
    score = Math.floor(score * 0.5)
  }

  return { score, factors }
}

async function runTest() {
  console.log('='.repeat(80))
  console.log('MY FEED ALGORITHM TEST')
  console.log('Threshold: 60 points')
  console.log('='.repeat(80))

  // Fetch all articles from last 12 weeks
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7)

  let allArticles: any[] = []
  let page = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('news_items')
      .select('id, title, summary, category, companies, published_at')
      .gte('published_at', twelveWeeksAgo.toISOString())
      .order('published_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      console.error('Error:', error.message)
      return
    }

    if (!data || data.length === 0) break
    allArticles = allArticles.concat(data)
    page++
    if (data.length < pageSize) break
  }

  console.log(`\nTotal articles in last 12 weeks: ${allArticles.length}`)

  const now = new Date()

  // Test each profile
  for (const profile of TEST_PROFILES) {
    console.log('\n' + '='.repeat(80))
    console.log(`PROFILE: ${profile.name}`)
    console.log(`Categories: ${profile.categories.join(', ')}`)
    console.log(`Keywords: ${profile.keywords.join(', ') || '(none)'}`)
    console.log(`Companies: ${profile.companies.join(', ') || '(none)'}`)
    console.log('='.repeat(80))

    // Filter by category first
    const categoryFiltered = allArticles.filter(a => profile.categories.includes(a.category))
    console.log(`After category filter: ${categoryFiltered.length} articles`)

    // Calculate scores
    const scored = categoryFiltered.map(article => {
      const { score, factors } = calculateScore(article, profile)
      return { ...article, score, factors }
    })

    // Apply adaptive threshold based on interest configuration
    const hasKeywords = profile.keywords.length > 0
    const hasCompanies = profile.companies.length > 0
    const hasSpecificInterests = hasKeywords || hasCompanies
    const hasBothInterestTypes = hasKeywords && hasCompanies
    // Category-only users: 25 threshold (event signal required)
    const threshold = hasBothInterestTypes ? 60 : hasSpecificInterests ? 55 : 25

    const passed = scored.filter(a => a.score >= threshold)

    const thresholdLabel = hasBothInterestTypes
      ? '≥60 (both types)'
      : hasSpecificInterests
        ? '≥55 (single type)'
        : '≥25 (event signal)'
    console.log(`After importance filter (${thresholdLabel}): ${passed.length} articles`)

    // Group by week
    const weekStats: Record<string, number> = {}
    passed.forEach(article => {
      const itemDate = new Date(article.published_at)
      const weekNum = Math.floor((now.getTime() - itemDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const weekKey = `Week-${weekNum}`
      weekStats[weekKey] = (weekStats[weekKey] || 0) + 1
    })

    console.log('\nArticles per week:')
    Object.entries(weekStats)
      .sort((a, b) => parseInt(a[0].split('-')[1]) - parseInt(b[0].split('-')[1]))
      .slice(0, 6)
      .forEach(([week, count]) => {
        console.log(`  ${week}: ${count} articles`)
      })

    // Show score distribution
    const scoreRanges = {
      '90-100': 0,
      '75-89': 0,
      '60-74': 0,
      '45-59': 0,
      '30-44': 0,
      '0-29': 0,
    }
    scored.forEach(a => {
      if (a.score >= 90) scoreRanges['90-100']++
      else if (a.score >= 75) scoreRanges['75-89']++
      else if (a.score >= 60) scoreRanges['60-74']++
      else if (a.score >= 45) scoreRanges['45-59']++
      else if (a.score >= 30) scoreRanges['30-44']++
      else scoreRanges['0-29']++
    })

    console.log('\nScore distribution:')
    Object.entries(scoreRanges).forEach(([range, count]) => {
      const bar = '█'.repeat(Math.min(Math.floor(count / 5), 40))
      console.log(`  ${range}: ${count.toString().padStart(4)} ${bar}`)
    })

    // Show sample passing articles
    console.log('\nSample passing articles (top 5 by score):')
    passed
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .forEach((article, i) => {
        const factors = Object.entries(article.factors)
          .filter(([_, v]) => v > 0)
          .map(([k, v]) => `${k}:${v}`)
          .join(' + ')
        console.log(`  ${i + 1}. [${article.score}pts] ${article.title.slice(0, 60)}...`)
        console.log(`     Factors: ${factors}`)
      })

    // Show sample failing articles (just below threshold)
    if (hasSpecificInterests) {
      const almostPassed = scored
        .filter(a => a.score >= 45 && a.score < 60)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      if (almostPassed.length > 0) {
        console.log('\nSample filtered out (45-59 pts):')
        almostPassed.forEach((article, i) => {
          const factors = Object.entries(article.factors)
            .filter(([_, v]) => v > 0)
            .map(([k, v]) => `${k}:${v}`)
            .join(' + ')
          console.log(`  ${i + 1}. [${article.score}pts] ${article.title.slice(0, 60)}...`)
          console.log(`     Factors: ${factors}`)
        })
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('TEST COMPLETE')
  console.log('='.repeat(80))
}

runTest()
