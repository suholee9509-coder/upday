/**
 * Bluesky Auto-Post Configuration
 *
 * Environment variables required:
 * - BLUESKY_IDENTIFIER (handle like 'updayapp.bsky.social')
 * - BLUESKY_APP_PASSWORD (app password from settings)
 */

export const config = {
  // Site URL for redirect tracking
  siteUrl: process.env.SITE_URL || 'https://updayapp.com',

  // RSS Feed URL
  rssFeedUrl: process.env.RSS_FEED_URL || 'https://upday-feed.suholee9509-98c.workers.dev',

  // Bluesky credentials (from environment)
  bluesky: {
    identifier: process.env.BLUESKY_IDENTIFIER || '',
    appPassword: process.env.BLUESKY_APP_PASSWORD || '',
    service: 'https://bsky.social',
  },

  // Posting settings
  posting: {
    // Maximum articles to post per run (to avoid rate limits)
    maxPostsPerRun: 5,
    // Delay between posts in milliseconds (3 seconds)
    delayBetweenPosts: 3000,
    // Maximum post length (Bluesky allows 300 graphemes)
    maxPostLength: 300,
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

  // Category hashtags (global, high-traffic tags)
  categoryHashtags: {
    ai: '#AI #MachineLearning',
    startups: '#Startups #VentureCapital',
    dev: '#Programming #Coding',
    product: '#ProductHunt #UX',
    research: '#Science #Research',
    space: '#Space #SpaceX',
    science: '#Science #Research',
    startup: '#Startups #VentureCapital',
  } as Record<string, string>,

  // Base hashtags (global tech community)
  baseHashtags: ['#Tech', '#TechNews'],

  // Priority sources (these get posted first)
  prioritySources: [
    'TechCrunch',
    'The Verge',
    'Wired',
    'MIT Technology Review',
    'Ars Technica',
    'VentureBeat',
    'Vercel Blog',
    'Google AI Blog',
    'Microsoft Blog',
    'OpenAI Blog',
  ],

  // State file for tracking last posted article
  stateFilePath: process.env.STATE_FILE_PATH || '/tmp/bluesky-auto-post-state.json',
}

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.bluesky.identifier) {
    errors.push('BLUESKY_IDENTIFIER is required')
  }
  if (!config.bluesky.appPassword) {
    errors.push('BLUESKY_APP_PASSWORD is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
