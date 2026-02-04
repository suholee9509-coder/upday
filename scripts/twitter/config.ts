/**
 * Twitter Auto-Post Configuration
 *
 * Environment variables required:
 * - TWITTER_API_KEY
 * - TWITTER_API_SECRET
 * - TWITTER_ACCESS_TOKEN
 * - TWITTER_ACCESS_SECRET
 */

export const config = {
  // RSS Feed URL
  rssFeedUrl: process.env.RSS_FEED_URL || 'https://updayapp.com/feed.xml',

  // Twitter API credentials (from environment)
  twitter: {
    apiKey: process.env.TWITTER_API_KEY || '',
    apiSecret: process.env.TWITTER_API_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  },

  // Posting settings
  posting: {
    // Maximum articles to post per run (to avoid rate limits)
    maxPostsPerRun: 5,
    // Delay between posts in milliseconds (5 seconds)
    delayBetweenPosts: 5000,
    // Maximum tweet length
    maxTweetLength: 280,
    // Maximum title length before truncation
    maxTitleLength: 120,
  },

  // Category to emoji mapping for engagement
  categoryEmojis: {
    ai: '🤖',
    startups: '🚀',
    dev: '💻',
    product: '🎨',
    research: '🔬',
    space: '🌌',
    default: '📰',
  } as Record<string, string>,

  // Category to single hashtag (keep it minimal for better reach)
  categoryHashtags: {
    ai: '#AI',
    startups: '#Startups',
    dev: '#Dev',
    product: '#Product',
    research: '#Research',
    space: '#Space',
  } as Record<string, string>,

  // Base hashtag (only brand tag)
  baseHashtags: ['#Upday'],

  // State file for tracking last posted article
  stateFilePath: process.env.STATE_FILE_PATH || '/tmp/twitter-auto-post-state.json',
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.twitter.apiKey) {
    errors.push('TWITTER_API_KEY is required')
  }
  if (!config.twitter.apiSecret) {
    errors.push('TWITTER_API_SECRET is required')
  }
  if (!config.twitter.accessToken) {
    errors.push('TWITTER_ACCESS_TOKEN is required')
  }
  if (!config.twitter.accessSecret) {
    errors.push('TWITTER_ACCESS_SECRET is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
