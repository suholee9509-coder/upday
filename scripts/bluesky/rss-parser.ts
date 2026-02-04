/**
 * RSS Feed Parser for Bluesky Auto-Post
 *
 * Parses Upday's RSS feed and extracts article information
 */

import { config } from './config'

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: Date
  category: string
  source: string
  guid: string
}

interface ParsedFeed {
  title: string
  link: string
  description: string
  lastBuildDate: Date | null
  items: FeedItem[]
}

/**
 * Fetch and parse RSS feed
 */
export async function fetchRssFeed(): Promise<ParsedFeed> {
  console.log(`Fetching RSS feed from: ${config.rssFeedUrl}`)

  const response = await fetch(config.rssFeedUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status} ${response.statusText}`)
  }

  const xmlText = await response.text()
  return parseRssXml(xmlText)
}

/**
 * Parse RSS XML string into structured data
 * Using regex-based parsing to avoid external dependencies
 */
function parseRssXml(xml: string): ParsedFeed {
  // Extract channel info
  const channelTitle = extractTagContent(xml, 'title') || 'Upday'
  const channelLink = extractTagContent(xml, 'link') || ''
  const channelDescription = extractTagContent(xml, 'description') || ''
  const lastBuildDateStr = extractTagContent(xml, 'lastBuildDate')
  const lastBuildDate = lastBuildDateStr ? new Date(lastBuildDateStr) : null

  // Extract all items
  const items: FeedItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let itemMatch

  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const itemXml = itemMatch[1]

    const title = extractCdataContent(itemXml, 'title') || extractTagContent(itemXml, 'title') || ''
    const link = extractTagContent(itemXml, 'link') || ''
    const description =
      extractCdataContent(itemXml, 'description') || extractTagContent(itemXml, 'description') || ''
    const pubDateStr = extractTagContent(itemXml, 'pubDate') || ''
    const category = extractTagContent(itemXml, 'category') || ''
    const source = extractSourceName(itemXml) || ''
    const guid = extractTagContent(itemXml, 'guid') || link

    items.push({
      title: cleanText(title),
      link,
      description: cleanText(description),
      pubDate: new Date(pubDateStr),
      category,
      source,
      guid,
    })
  }

  console.log(`Parsed ${items.length} items from RSS feed`)

  return {
    title: channelTitle,
    link: channelLink,
    description: channelDescription,
    lastBuildDate,
    items,
  }
}

/**
 * Extract content from a simple XML tag
 */
function extractTagContent(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([^<]*)</${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

/**
 * Extract CDATA content from a tag
 */
function extractCdataContent(xml: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tagName}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

/**
 * Extract source name from <source> tag
 */
function extractSourceName(xml: string): string | null {
  const regex = /<source[^>]*>([^<]*)<\/source>/i
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

/**
 * Clean text by removing extra whitespace and newlines
 */
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Filter items that are newer than a given date
 */
export function filterNewItems(items: FeedItem[], since: Date): FeedItem[] {
  return items.filter((item) => item.pubDate > since).sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime()) // oldest first
}

/**
 * Validate that RSS feed has required fields
 */
export function validateFeedItems(items: FeedItem[]): {
  valid: FeedItem[]
  invalid: FeedItem[]
} {
  const valid: FeedItem[] = []
  const invalid: FeedItem[] = []

  for (const item of items) {
    if (item.title && item.link && item.pubDate && !isNaN(item.pubDate.getTime())) {
      valid.push(item)
    } else {
      invalid.push(item)
    }
  }

  return { valid, invalid }
}
