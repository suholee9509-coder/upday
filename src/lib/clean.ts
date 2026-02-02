/**
 * Content Cleaning Module
 * Removes HTML, ads, boilerplate, and normalizes article content
 */

/**
 * Remove HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    // Remove script and style content entirely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    // Remove other HTML entities
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/gi, ' ')
}

/**
 * Remove common ad markers and promotional content
 */
function stripAds(text: string): string {
  return text
    // Ad markers
    .replace(/\[ad(vertisement)?\]/gi, '')
    .replace(/\[sponsored\]/gi, '')
    .replace(/\[promo(tion)?\]/gi, '')
    // Common ad phrases
    .replace(/sponsored content/gi, '')
    .replace(/paid partnership/gi, '')
    .replace(/advertisement/gi, '')
}

/**
 * Remove common boilerplate text
 */
function stripBoilerplate(text: string): string {
  return text
    // Newsletter/subscription prompts
    .replace(/subscribe to our newsletter.*/gi, '')
    .replace(/sign up for.*(newsletter|updates|alerts).*/gi, '')
    .replace(/get the latest.*(news|updates|stories).*/gi, '')
    // Social media prompts
    .replace(/follow us on.*(twitter|facebook|instagram|linkedin).*/gi, '')
    .replace(/share this (article|story|post).*/gi, '')
    .replace(/like us on facebook.*/gi, '')
    // Comments section prompts
    .replace(/leave a comment.*/gi, '')
    .replace(/join the (conversation|discussion).*/gi, '')
    // Cookie notices
    .replace(/we use cookies.*/gi, '')
    .replace(/by continuing to.*(browse|use|visit).*/gi, '')
    // Author bios at the end
    .replace(/about the author.*/gi, '')
    .replace(/\[author:.*?\]/gi, '')
    // Read more prompts
    .replace(/read more:?.*/gi, '')
    .replace(/related articles?:?.*/gi, '')
    .replace(/see also:?.*/gi, '')
    // Copyright notices
    .replace(/©.*/gi, '')
    .replace(/all rights reserved.*/gi, '')
}

/**
 * Normalize whitespace
 */
function normalizeWhitespace(text: string): string {
  return text
    // Convert various whitespace to regular spaces
    .replace(/[\t\r\f\v]+/g, ' ')
    // Collapse multiple spaces
    .replace(/ +/g, ' ')
    // Collapse multiple newlines to double newline (paragraph break)
    .replace(/\n\n+/g, '\n\n')
    // Remove leading/trailing whitespace from lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim()
}

/**
 * Remove URLs from text (optional, for cleaner summaries)
 */
function stripUrls(text: string): string {
  return text.replace(/https?:\/\/[^\s]+/gi, '')
}

/**
 * Main cleaning function for article body
 */
export function cleanArticleBody(body: string): string {
  if (!body) return ''

  let cleaned = body

  // Step 1: Strip HTML
  cleaned = stripHtml(cleaned)

  // Step 2: Remove ads
  cleaned = stripAds(cleaned)

  // Step 3: Remove boilerplate
  cleaned = stripBoilerplate(cleaned)

  // Step 4: Remove URLs
  cleaned = stripUrls(cleaned)

  // Step 5: Normalize whitespace
  cleaned = normalizeWhitespace(cleaned)

  return cleaned
}

/**
 * Clean and truncate article body for storage
 * (Body is stored but not sent to client, so we can keep it long)
 */
export function cleanAndTruncateBody(body: string, maxLength: number = 10000): string {
  const cleaned = cleanArticleBody(body)

  if (cleaned.length <= maxLength) {
    return cleaned
  }

  // Truncate at word boundary
  const truncated = cleaned.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Clean title (lighter processing)
 */
export function cleanTitle(title: string): string {
  if (!title) return ''

  return title
    // Remove HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Remove site name suffixes (common pattern: "Title | SiteName")
    .replace(/\s*[\|–—-]\s*[^|–—-]+$/, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Validate that cleaned content meets minimum quality standards
 */
export function isValidContent(title: string, body: string): boolean {
  const cleanedTitle = cleanTitle(title)
  const cleanedBody = cleanArticleBody(body)

  // Title must be at least 10 characters
  if (cleanedTitle.length < 10) {
    return false
  }

  // Body must be at least 100 characters
  if (cleanedBody.length < 100) {
    return false
  }

  // Title shouldn't be all caps (spam indicator)
  if (cleanedTitle === cleanedTitle.toUpperCase() && cleanedTitle.length > 20) {
    return false
  }

  return true
}
