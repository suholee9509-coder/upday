/**
 * Telegram Auto-Post Configuration
 *
 * Environment variables required:
 * - TELEGRAM_BOT_TOKEN (from BotFather)
 * - TELEGRAM_CHANNEL_ID (channel username like @updayapp)
 */

export const config = {
  // Site URL for redirect tracking
  siteUrl: process.env.SITE_URL || 'https://updayapp.com',

  // RSS Feed URL
  rssFeedUrl: process.env.RSS_FEED_URL || 'https://updayapp.com/feed.xml',

  // Telegram Bot credentials (from environment)
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@updayapp',
  },

  // Posting settings
  posting: {
    // Maximum articles to post per run
    maxPostsPerRun: 5,
    // Delay between posts in milliseconds (2 seconds)
    delayBetweenPosts: 2000,
  },

  // Category emojis
  categoryEmojis: {
    ai: '🤖',
    startups: '🚀',
    dev: '💻',
    product: '🎨',
    research: '🔬',
    space: '🌌',
    science: '🧬',
    startup: '🚀',
    default: '📰',
  } as Record<string, string>,

  // State file for tracking last posted article
  stateFilePath: process.env.STATE_FILE_PATH || '/tmp/telegram-auto-post-state.json',
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.telegram.botToken) {
    errors.push('TELEGRAM_BOT_TOKEN is required')
  }
  if (!config.telegram.channelId) {
    errors.push('TELEGRAM_CHANNEL_ID is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
