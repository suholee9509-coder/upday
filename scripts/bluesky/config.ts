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

  // Trending/popular tag mappings
  // Keywords (case-insensitive) in title/description → hashtags to add
  // Max 2 trending tags per post to avoid spam
  trendingTags: [
    // People
    { keywords: ['elon musk', 'musk'], tags: ['#ElonMusk'] },
    { keywords: ['sam altman'], tags: ['#SamAltman'] },
    { keywords: ['jensen huang'], tags: ['#Jensen'] },
    { keywords: ['mark zuckerberg', 'zuckerberg'], tags: ['#Zuckerberg'] },
    { keywords: ['tim cook'], tags: ['#Apple'] },
    { keywords: ['satya nadella'], tags: ['#Microsoft'] },
    { keywords: ['sundar pichai'], tags: ['#Google'] },
    // Companies & Products - AI
    { keywords: ['openai', 'chatgpt', 'gpt-4', 'gpt-5', 'gpt4', 'gpt5', 'dall-e', 'sora'], tags: ['#OpenAI', '#ChatGPT'] },
    { keywords: ['anthropic', 'claude'], tags: ['#Anthropic', '#Claude'] },
    { keywords: ['google ai', 'gemini', 'deepmind', 'bard'], tags: ['#Google', '#Gemini'] },
    { keywords: ['meta ai', 'llama', 'meta platforms'], tags: ['#Meta', '#LLaMA'] },
    { keywords: ['mistral'], tags: ['#Mistral'] },
    { keywords: ['xai', 'grok'], tags: ['#xAI', '#Grok'] },
    { keywords: ['copilot', 'github copilot'], tags: ['#Copilot'] },
    { keywords: ['midjourney'], tags: ['#Midjourney'] },
    { keywords: ['stable diffusion', 'stability ai'], tags: ['#StableDiffusion'] },
    { keywords: ['perplexity'], tags: ['#Perplexity'] },
    // Companies - Big Tech
    { keywords: ['nvidia', 'gpu', 'cuda'], tags: ['#NVIDIA'] },
    { keywords: ['apple', 'iphone', 'vision pro', 'wwdc', 'ios'], tags: ['#Apple'] },
    { keywords: ['microsoft', 'azure', 'windows'], tags: ['#Microsoft'] },
    { keywords: ['google', 'alphabet'], tags: ['#Google'] },
    { keywords: ['amazon', 'aws'], tags: ['#Amazon', '#AWS'] },
    { keywords: ['tesla', 'cybertruck', 'autopilot'], tags: ['#Tesla'] },
    // Companies - Tech
    { keywords: ['spacex', 'starship', 'starlink', 'falcon'], tags: ['#SpaceX'] },
    { keywords: ['stripe'], tags: ['#Stripe'] },
    { keywords: ['shopify'], tags: ['#Shopify'] },
    { keywords: ['figma'], tags: ['#Figma'] },
    { keywords: ['vercel', 'next.js', 'nextjs'], tags: ['#Vercel', '#NextJS'] },
    { keywords: ['supabase'], tags: ['#Supabase'] },
    { keywords: ['cloudflare'], tags: ['#Cloudflare'] },
    { keywords: ['cursor'], tags: ['#CursorAI'] },
    { keywords: ['notion'], tags: ['#Notion'] },
    { keywords: ['linear'], tags: ['#Linear'] },
    // Topics - trending
    { keywords: ['large language model', 'llm', 'llms'], tags: ['#LLM'] },
    { keywords: ['agi', 'artificial general intelligence'], tags: ['#AGI'] },
    { keywords: ['open source', 'open-source', 'opensource'], tags: ['#OpenSource'] },
    { keywords: ['bitcoin', 'btc', 'cryptocurrency', 'crypto'], tags: ['#Bitcoin', '#Crypto'] },
    { keywords: ['ethereum', 'eth'], tags: ['#Ethereum'] },
    { keywords: ['web3', 'blockchain'], tags: ['#Web3'] },
    { keywords: ['cybersecurity', 'data breach', 'ransomware', 'hack'], tags: ['#CyberSecurity'] },
    { keywords: ['climate', 'renewable', 'carbon', 'sustainability'], tags: ['#ClimateAction'] },
    { keywords: ['layoff', 'layoffs', 'job cuts'], tags: ['#Layoffs'] },
    { keywords: ['ipo'], tags: ['#IPO'] },
    { keywords: ['acquisition', 'acquire', 'merger'], tags: ['#MA'] },
    { keywords: ['series a', 'series b', 'series c', 'funding round', 'raised'], tags: ['#Funding'] },
    { keywords: ['autonomous', 'self-driving', 'robotaxi'], tags: ['#AutonomousDriving'] },
    { keywords: ['robot', 'robotics', 'humanoid'], tags: ['#Robotics'] },
    { keywords: ['quantum', 'quantum computing'], tags: ['#QuantumComputing'] },
  ] as Array<{ keywords: string[]; tags: string[] }>,

  // Max trending tags to add per post
  maxTrendingTags: 2,

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
