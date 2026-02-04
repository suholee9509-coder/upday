/**
 * Twitter API Client for Auto-Posting
 *
 * Uses Twitter API v2 for posting tweets
 */

import { TwitterApi } from 'twitter-api-v2'
import { config, validateConfig } from './config'
import type { FeedItem } from './rss-parser'

let twitterClient: TwitterApi | null = null

/**
 * Initialize Twitter client with credentials
 */
export function initializeTwitterClient(): TwitterApi {
  const validation = validateConfig()
  if (!validation.valid) {
    throw new Error(`Twitter configuration invalid: ${validation.errors.join(', ')}`)
  }

  twitterClient = new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiSecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessSecret,
  })

  console.log('Twitter client initialized')
  return twitterClient
}

/**
 * Get the Twitter client instance
 */
export function getTwitterClient(): TwitterApi {
  if (!twitterClient) {
    return initializeTwitterClient()
  }
  return twitterClient
}

/**
 * Format a feed item into a tweet
 * Format: {emoji} {title}\n\n{link}\n\n{hashtags}
 */
export function formatTweet(item: FeedItem): string {
  const { maxTitleLength, maxTweetLength } = config.posting

  // Get category emoji
  const emoji = getCategoryEmoji(item.category)

  // Truncate title if needed
  let title = item.title
  if (title.length > maxTitleLength) {
    title = title.substring(0, maxTitleLength - 3) + '...'
  }

  // Generate hashtags (minimal: 1 category + 1 brand)
  const hashtags = generateHashtags(item.category)

  // Build tweet with engaging format
  const tweetParts = [
    `${emoji} ${title}`,
    ``,
    `🔗 ${item.link}`,
    ``,
    hashtags
  ]

  let tweet = tweetParts.join('\n')

  // Ensure tweet fits in limit
  if (tweet.length > maxTweetLength) {
    // Remove hashtags if too long
    tweet = `${emoji} ${title}\n\n🔗 ${item.link}`
    if (tweet.length > maxTweetLength) {
      // Further truncate title
      const availableLength = maxTweetLength - item.link.length - 15 // buffer for emojis and newlines
      title = item.title.substring(0, availableLength) + '...'
      tweet = `${emoji} ${title}\n\n🔗 ${item.link}`
    }
  }

  return tweet
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  const emoji = config.categoryEmojis[category.toLowerCase()]
  return emoji || config.categoryEmojis.default || '📰'
}

/**
 * Generate hashtags based on category (minimal for better reach)
 */
function generateHashtags(category: string): string {
  const tags: string[] = []

  // Add category-specific hashtag (just one)
  const categoryTag = config.categoryHashtags[category.toLowerCase()]
  if (categoryTag) {
    tags.push(categoryTag)
  }

  // Add brand hashtag
  tags.push(...config.baseHashtags)

  return tags.join(' ')
}

/**
 * Post a tweet
 */
export async function postTweet(text: string): Promise<{ id: string; text: string }> {
  const client = getTwitterClient()

  try {
    const result = await client.v2.tweet(text)
    console.log(`Tweet posted successfully: ${result.data.id}`)
    return {
      id: result.data.id,
      text: result.data.text,
    }
  } catch (error) {
    console.error('Failed to post tweet:', error)
    throw error
  }
}

/**
 * Post a feed item to Twitter
 */
export async function postFeedItem(item: FeedItem): Promise<{ id: string; text: string }> {
  const tweet = formatTweet(item)
  console.log(`Posting: "${item.title.substring(0, 50)}..."`)
  return postTweet(tweet)
}

/**
 * Verify Twitter credentials are valid
 */
export async function verifyCredentials(): Promise<{ id: string; username: string }> {
  const client = getTwitterClient()

  try {
    const me = await client.v2.me()
    console.log(`Authenticated as: @${me.data.username} (${me.data.id})`)
    return {
      id: me.data.id,
      username: me.data.username,
    }
  } catch (error) {
    console.error('Failed to verify credentials:', error)
    throw error
  }
}
