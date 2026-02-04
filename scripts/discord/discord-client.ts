/**
 * Discord Webhook Client for Auto-Posting
 *
 * Posts rich embeds to Discord via webhook
 */

import { config, validateConfig } from './config'
import type { FeedItem } from '../bluesky/rss-parser'

interface DiscordEmbed {
  title: string
  description?: string
  url: string
  color: number
  thumbnail?: { url: string }
  image?: { url: string }
  footer?: { text: string; icon_url?: string }
  timestamp?: string
  author?: { name: string; url?: string; icon_url?: string }
}

interface DiscordWebhookPayload {
  username?: string
  avatar_url?: string
  content?: string
  embeds?: DiscordEmbed[]
}

/**
 * Generate tracking URL that goes through Upday for analytics
 */
function getTrackingUrl(originalUrl: string): string {
  return `${config.siteUrl}/go?url=${encodeURIComponent(originalUrl)}`
}

/**
 * Get color for category
 */
function getCategoryColor(category: string): number {
  return config.categoryColors[category.toLowerCase()] || config.categoryColors.default
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  return config.categoryEmojis[category.toLowerCase()] || config.categoryEmojis.default
}

/**
 * Fetch Open Graph image from URL
 */
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UpdayBot/1.0)',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]
    const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1]

    return ogImage || twitterImage || null
  } catch {
    return null
  }
}

/**
 * Create Discord embed for a feed item
 */
export async function createEmbed(item: FeedItem): Promise<DiscordEmbed> {
  const emoji = getCategoryEmoji(item.category)
  const color = getCategoryColor(item.category)
  const trackingUrl = getTrackingUrl(item.link)

  // Fetch OG image
  const ogImage = await fetchOgImage(item.link)

  const embed: DiscordEmbed = {
    title: `${emoji} ${item.title}`,
    url: trackingUrl,
    color,
    footer: {
      text: `${item.category.toUpperCase()} • via Upday`,
    },
    timestamp: item.pubDate,
  }

  // Add description if available
  if (item.description && item.description.length > 0) {
    let desc = item.description
    if (desc.length > 300) {
      desc = desc.substring(0, 300).trim() + '...'
    }
    embed.description = desc
  }

  // Add image if found
  if (ogImage) {
    embed.image = { url: ogImage }
  }

  return embed
}

/**
 * Post to Discord webhook
 */
export async function postToDiscord(payload: DiscordWebhookPayload): Promise<boolean> {
  const validation = validateConfig()
  if (!validation.valid) {
    throw new Error(`Discord configuration invalid: ${validation.errors.join(', ')}`)
  }

  const response = await fetch(config.discord.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: config.discord.username,
      avatar_url: config.discord.avatarUrl,
      ...payload,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Discord webhook failed: ${response.status} - ${error}`)
  }

  return true
}

/**
 * Post a feed item to Discord with rich embed
 */
export async function postFeedItem(item: FeedItem): Promise<boolean> {
  console.log(`Posting to Discord: "${item.title.substring(0, 50)}..."`)

  const embed = await createEmbed(item)

  await postToDiscord({
    embeds: [embed],
  })

  console.log(`Posted successfully: ${item.title.substring(0, 40)}...`)
  return true
}

/**
 * Test Discord webhook connection
 */
export async function testWebhook(): Promise<boolean> {
  console.log('Testing Discord webhook...')

  await postToDiscord({
    content: '🔔 **Upday Bot Connected!**\nTech news will be posted here automatically.',
  })

  console.log('Test message sent successfully!')
  return true
}
