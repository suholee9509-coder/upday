/**
 * AI Processing Module
 * Generates summaries and classifies articles using OpenAI or Anthropic
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import type { Category } from '@/types/news'
import { CATEGORIES } from './constants'

// Configuration
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'openai' // 'openai' or 'anthropic'
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

// Initialize clients
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true }) : null
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null

// Prompts
const SUMMARY_SYSTEM_PROMPT = `You are a concise news summarizer for a tech news platform. Your task is to generate a 2-3 line summary that captures "what happened" and "why it matters."

Rules:
- Be factual and objective - no opinion or interpretation
- Keep the summary between 100-250 characters
- Use present tense for recent events
- Do not start with "This article" or similar phrases
- Focus on the key news event and its significance
- Write in a professional, neutral tone`

const SUMMARY_USER_PROMPT = `Summarize this news article:

Title: {title}

Content:
{body}

Generate a 2-3 line summary (100-250 characters):`

const CLASSIFY_SYSTEM_PROMPT = `You are a news classifier. Classify articles into exactly ONE category based on the primary topic.

Categories:
- ai: Artificial intelligence, machine learning, LLMs, neural networks, chatbots
- startup: Startups, funding rounds, acquisitions, IPOs, entrepreneurship
- science: Scientific research, medical breakthroughs, biology, physics, chemistry
- design: Product design, UX/UI, visual design, creative tools, design systems
- space: Space exploration, aerospace, satellites, astronomy, rockets
- dev: Software development, programming, open source, infrastructure, DevOps

Respond with ONLY the category ID (ai, startup, science, design, space, or dev).`

const CLASSIFY_USER_PROMPT = `Classify this article:

Title: {title}

Content excerpt:
{body}

Category:`

/**
 * Retry with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      const delay = Math.pow(2, i) * 1000 // 1s, 2s, 4s
      console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, lastError.message)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Generate summary using OpenAI
 */
async function generateSummaryOpenAI(title: string, body: string): Promise<string> {
  if (!openai) throw new Error('OpenAI client not configured')

  const userPrompt = SUMMARY_USER_PROMPT
    .replace('{title}', title)
    .replace('{body}', body.slice(0, 2000))

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 150,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content?.trim() || ''
}

/**
 * Generate summary using Anthropic
 */
async function generateSummaryAnthropic(title: string, body: string): Promise<string> {
  if (!anthropic) throw new Error('Anthropic client not configured')

  const userPrompt = SUMMARY_USER_PROMPT
    .replace('{title}', title)
    .replace('{body}', body.slice(0, 2000))

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 150,
    system: SUMMARY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find(block => block.type === 'text')
  return textBlock && 'text' in textBlock ? textBlock.text.trim() : ''
}

/**
 * Classify article using OpenAI
 */
async function classifyOpenAI(title: string, body: string): Promise<Category> {
  if (!openai) throw new Error('OpenAI client not configured')

  const userPrompt = CLASSIFY_USER_PROMPT
    .replace('{title}', title)
    .replace('{body}', body.slice(0, 1000))

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: CLASSIFY_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 10,
    temperature: 0,
  })

  return response.choices[0]?.message?.content?.trim().toLowerCase() as Category
}

/**
 * Classify article using Anthropic
 */
async function classifyAnthropic(title: string, body: string): Promise<Category> {
  if (!anthropic) throw new Error('Anthropic client not configured')

  const userPrompt = CLASSIFY_USER_PROMPT
    .replace('{title}', title)
    .replace('{body}', body.slice(0, 1000))

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 10,
    system: CLASSIFY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find(block => block.type === 'text')
  const category = textBlock && 'text' in textBlock ? textBlock.text.trim().toLowerCase() : ''
  return category as Category
}

/**
 * Validate category is valid
 */
function validateCategory(category: string): Category {
  const validCategories = CATEGORIES.map(c => c.id)
  if (validCategories.includes(category as Category)) {
    return category as Category
  }
  console.warn('Invalid category returned:', category, '- defaulting to dev')
  return 'dev'
}

/**
 * Validate summary quality
 */
function validateSummary(summary: string, fallbackTitle: string): string {
  if (!summary || summary.length < 50) {
    console.warn('Summary too short, using title as fallback')
    return fallbackTitle
  }
  if (summary.length > 300) {
    console.warn('Summary too long, truncating')
    return summary.slice(0, 297) + '...'
  }
  return summary
}

/**
 * Generate summary for an article
 * Uses configured AI provider with retry logic
 */
export async function generateSummary(title: string, body: string): Promise<string> {
  try {
    const generator = AI_PROVIDER === 'anthropic' && anthropic
      ? generateSummaryAnthropic
      : generateSummaryOpenAI

    const summary = await withRetry(() => generator(title, body))
    return validateSummary(summary, title)
  } catch (error) {
    console.error('Summary generation failed:', error)
    return title // Fallback to title
  }
}

/**
 * Classify article into a category
 * Uses configured AI provider with retry logic
 */
export async function classifyCategory(title: string, body: string): Promise<Category> {
  try {
    const classifier = AI_PROVIDER === 'anthropic' && anthropic
      ? classifyAnthropic
      : classifyOpenAI

    const category = await withRetry(() => classifier(title, body))
    return validateCategory(category)
  } catch (error) {
    console.error('Classification failed:', error)
    return 'dev' // Default fallback
  }
}

/**
 * Process article with both summary and classification
 */
export async function processArticleAI(
  title: string,
  body: string
): Promise<{ summary: string; category: Category }> {
  const [summary, category] = await Promise.all([
    generateSummary(title, body),
    classifyCategory(title, body),
  ])

  return { summary, category }
}

/**
 * Batch process multiple articles with rate limiting
 */
export async function processArticlesBatch(
  articles: { title: string; body: string }[],
  concurrency: number = 3
): Promise<{ summary: string; category: Category }[]> {
  const results: { summary: string; category: Category }[] = []

  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency)

    const batchResults = await Promise.all(
      batch.map(article => processArticleAI(article.title, article.body))
    )

    results.push(...batchResults)

    // Rate limit: wait 1 second between batches
    if (i + concurrency < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}

/**
 * Check if AI is configured
 */
export function isAIConfigured(): boolean {
  return !!(openai || anthropic)
}

/**
 * Get current AI provider
 */
export function getAIProvider(): string {
  if (AI_PROVIDER === 'anthropic' && anthropic) return 'anthropic'
  if (openai) return 'openai'
  return 'none'
}
