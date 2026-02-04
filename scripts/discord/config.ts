/**
 * Discord Auto-Post Configuration
 *
 * Environment variables required:
 * - DISCORD_WEBHOOK_URL (from Discord channel settings)
 */

export const config = {
  // Site URL for redirect tracking
  siteUrl: process.env.SITE_URL || 'https://updayapp.com',

  // RSS Feed URL
  rssFeedUrl: process.env.RSS_FEED_URL || 'https://upday-feed.suholee9509-98c.workers.dev',

  // Discord webhook URL (from environment)
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    username: 'Upday Tech News',
    avatarUrl: 'https://updayapp.com/favicon.svg',
  },

  // Posting settings
  posting: {
    // Maximum articles to post per run
    maxPostsPerRun: 5,
    // Delay between posts in milliseconds (2 seconds)
    delayBetweenPosts: 2000,
  },

  // Category colors for Discord embeds (hex)
  categoryColors: {
    ai: 0x10b981, // green
    startups: 0xf59e0b, // amber
    dev: 0x3b82f6, // blue
    product: 0x8b5cf6, // purple
    research: 0xec4899, // pink
    space: 0x06b6d4, // cyan
    science: 0xec4899, // pink
    startup: 0xf59e0b, // amber
    default: 0x6b7280, // gray
  } as Record<string, number>,

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
  stateFilePath: process.env.STATE_FILE_PATH || '/tmp/discord-auto-post-state.json',
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.discord.webhookUrl) {
    errors.push('DISCORD_WEBHOOK_URL is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
