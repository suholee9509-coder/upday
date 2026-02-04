/**
 * Telegram Bot API Client for Auto-Posting
 *
 * Posts messages to Telegram channel via Bot API
 */

import { config, validateConfig } from './config'
import type { FeedItem } from '../bluesky/rss-parser'

const TELEGRAM_API = 'https://api.telegram.org/bot'

/**
 * Generate tracking URL that goes through Upday for analytics
 */
function getTrackingUrl(originalUrl: string): string {
  return `${config.siteUrl}/go?url=${encodeURIComponent(originalUrl)}`
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  return config.categoryEmojis[category.toLowerCase()] || config.categoryEmojis.default
}

/**
 * Send request to Telegram Bot API
 */
async function telegramApi(method: string, params: Record<string, any>): Promise<any> {
  const url = `${TELEGRAM_API}${config.telegram.botToken}/${method}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  const data = await response.json()

  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`)
  }

  return data.result
}

/**
 * Format a feed item into Telegram message with HTML formatting
 */
export function formatMessage(item: FeedItem): { text: string; originalUrl: string } {
  const emoji = getCategoryEmoji(item.category)
  const trackingUrl = getTrackingUrl(item.link)

  // Build message with HTML formatting
  const parts: string[] = [
    `${emoji} <b>${escapeHtml(item.title)}</b>`,
    '',
  ]

  // Add description if available
  if (item.description && item.description.length > 0) {
    let desc = item.description
    if (desc.length > 200) {
      desc = desc.substring(0, 200).trim() + '...'
    }
    parts.push(`<i>${escapeHtml(desc)}</i>`)
    parts.push('')
  }

  // Add category tag and link
  parts.push(`#${item.category} #TechNews`)
  parts.push('')
  parts.push(`<a href="${trackingUrl}">Read more →</a>`)

  return {
    text: parts.join('\n'),
    originalUrl: item.link,
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Post a message to Telegram channel with link preview from original URL
 */
export async function sendMessage(text: string, previewUrl?: string): Promise<any> {
  const validation = validateConfig()
  if (!validation.valid) {
    throw new Error(`Telegram configuration invalid: ${validation.errors.join(', ')}`)
  }

  const params: Record<string, any> = {
    chat_id: config.telegram.channelId,
    text,
    parse_mode: 'HTML',
  }

  // Use original article URL for link preview (shows correct thumbnail/title)
  // while keeping tracking URL in the message text
  if (previewUrl) {
    params.link_preview_options = {
      url: previewUrl,
      prefer_large_media: true,
      show_above_text: false,
    }
  }

  return telegramApi('sendMessage', params)
}

/**
 * Post a feed item to Telegram channel
 */
export async function postFeedItem(item: FeedItem): Promise<any> {
  console.log(`Posting to Telegram: "${item.title.substring(0, 50)}..."`)

  const { text, originalUrl } = formatMessage(item)
  const result = await sendMessage(text, originalUrl)

  console.log(`Posted successfully: message_id=${result.message_id}`)
  return result
}

/**
 * Test bot connection and permissions
 */
export async function testConnection(): Promise<{ botName: string; canPost: boolean }> {
  // Get bot info
  const botInfo = await telegramApi('getMe', {})
  console.log(`Bot: @${botInfo.username} (${botInfo.first_name})`)

  // Try to get chat info
  try {
    const chatInfo = await telegramApi('getChat', {
      chat_id: config.telegram.channelId,
    })
    console.log(`Channel: ${chatInfo.title} (${chatInfo.username})`)

    return {
      botName: botInfo.username,
      canPost: true,
    }
  } catch (error) {
    console.error('Cannot access channel:', error)
    return {
      botName: botInfo.username,
      canPost: false,
    }
  }
}
