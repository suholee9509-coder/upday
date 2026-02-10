/**
 * Bluesky API Client for Auto-Posting
 *
 * Uses AT Protocol for posting to Bluesky
 * Features: Rich text, link cards with images, engaging hooks
 */

import { BskyAgent, RichText } from '@atproto/api'
import { config, validateConfig } from './config'
import type { FeedItem } from './rss-parser'
import { translatePostToKorean, isTranslationAvailable } from './translate'

let agent: BskyAgent | null = null
let agentKr: BskyAgent | null = null

/**
 * Initialize Bluesky agent with credentials
 */
export async function initializeBlueskyClient(): Promise<BskyAgent> {
  const validation = validateConfig()
  if (!validation.valid) {
    throw new Error(`Bluesky configuration invalid: ${validation.errors.join(', ')}`)
  }

  agent = new BskyAgent({ service: config.bluesky.service })

  await agent.login({
    identifier: config.bluesky.identifier,
    password: config.bluesky.appPassword,
  })

  console.log('Bluesky client initialized and logged in')
  return agent
}

/**
 * Initialize Korean Bluesky account (optional)
 * Returns null if credentials are not configured
 */
export async function initializeKrClient(): Promise<BskyAgent | null> {
  if (!config.blueskyKr.identifier || !config.blueskyKr.appPassword) {
    console.log('Korean Bluesky account not configured, skipping')
    return null
  }

  try {
    agentKr = new BskyAgent({ service: config.blueskyKr.service })

    await agentKr.login({
      identifier: config.blueskyKr.identifier,
      password: config.blueskyKr.appPassword,
    })

    console.log(`Korean Bluesky client initialized: @${config.blueskyKr.identifier}`)
    return agentKr
  } catch (error) {
    console.warn('Failed to initialize Korean Bluesky client:', error)
    agentKr = null
    return null
  }
}

/**
 * Get the Bluesky agent instance
 */
export async function getBlueskyAgent(): Promise<BskyAgent> {
  if (!agent) {
    return initializeBlueskyClient()
  }
  return agent
}

/**
 * Check if Korean account is available
 */
export function hasKrAccount(): boolean {
  return agentKr !== null
}

/**
 * Category-specific hook phrases for engagement (English for global reach)
 */
const categoryHooks: Record<string, string[]> = {
  ai: [
    '🔥 AI Breaking',
    '⚡ AI Alert',
    '🚨 AI News',
    '💡 AI Insight',
  ],
  startups: [
    '💰 Funding Alert',
    '🚀 Startup News',
    '📈 VC Watch',
    '🎯 Founder Alert',
  ],
  dev: [
    '👨‍💻 Dev Alert',
    '🛠️ Dev Trend',
    '💻 Code News',
    '⚙️ Tech Update',
  ],
  product: [
    '🎨 Product News',
    '✨ New Launch',
    '📱 UX Insight',
    '🎯 PM Alert',
  ],
  research: [
    '🔬 Research Brief',
    '📊 Science News',
    '🧪 Study Alert',
    '📖 Academia',
  ],
  space: [
    '🌌 Space News',
    '🚀 Space Update',
    '🛸 Aerospace',
    '🌍 Orbit Watch',
  ],
  science: [
    '🔬 Science Brief',
    '🧬 Science News',
    '📊 Research Insight',
    '💡 Discovery',
  ],
  startup: [
    '💰 Funding Alert',
    '🚀 Startup News',
    '📈 VC Watch',
    '🎯 Founder Alert',
  ],
  default: [
    '📰 Tech News',
    '⚡ Breaking',
    '🔔 Alert',
    '📢 Industry Update',
  ],
}

/**
 * Get a random hook phrase for the category
 */
function getHookPhrase(category: string): string {
  const hooks = categoryHooks[category.toLowerCase()] || categoryHooks.default
  return hooks[Math.floor(Math.random() * hooks.length)]
}

/**
 * Format a feed item into an engaging Bluesky post
 */
export function formatPost(item: FeedItem): string {
  const { maxPostLength } = config.posting

  // Get hook phrase and emoji
  const hook = getHookPhrase(item.category)

  // Create engaging text with description
  let description = item.description || ''
  if (description.length > 100) {
    description = description.substring(0, 100).trim() + '...'
  }

  // Generate hashtags (category + trending from content)
  const hashtags = generateHashtags(item.category, item.title, item.description)

  // Build post: Hook + Title + Description snippet + Hashtags
  // Link will be in the card, not in text
  const parts: string[] = [
    hook,
    '',
    item.title,
  ]

  // Add description if meaningful
  if (description && description.length > 20 && !description.includes('Liquid syntax error')) {
    parts.push('')
    parts.push(`"${description}"`)
  }

  parts.push('')
  parts.push(hashtags)

  let post = parts.join('\n')

  // Trim if too long (leave room for card)
  if (post.length > maxPostLength) {
    // Simplify: just hook + title + hashtags
    post = `${hook}\n\n${item.title}\n\n${hashtags}`
    if (post.length > maxPostLength) {
      const title = item.title.substring(0, maxPostLength - hook.length - hashtags.length - 10) + '...'
      post = `${hook}\n\n${title}\n\n${hashtags}`
    }
  }

  return post
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  const emoji = config.categoryEmojis[category.toLowerCase()]
  return emoji || config.categoryEmojis.default || '📰'
}

/**
 * Generate tracking URL that goes through Upday for analytics
 */
function getTrackingUrl(originalUrl: string): string {
  return `${config.siteUrl}/go?url=${encodeURIComponent(originalUrl)}`
}

/**
 * Generate hashtags based on category + trending tags from content
 */
function generateHashtags(category: string, title: string = '', description: string = ''): string {
  const tags: string[] = []

  const categoryTag = config.categoryHashtags[category.toLowerCase()]
  if (categoryTag) {
    tags.push(categoryTag)
  }

  tags.push(...config.baseHashtags)

  // Scan title + description for trending keywords and add up to maxTrendingTags
  const trendingTags = findTrendingTags(title, description, tags)
  if (trendingTags.length > 0) {
    tags.push(...trendingTags)
  }

  return tags.join(' ')
}

/**
 * Scan text for trending keywords and return matching hashtags (max 2)
 * Avoids duplicating tags already in the list
 */
function findTrendingTags(title: string, description: string, existingTags: string[]): string[] {
  const text = `${title} ${description}`.toLowerCase()
  const existing = new Set(existingTags.join(' ').toLowerCase().split(/\s+/))
  const matchedTags: string[] = []

  for (const mapping of config.trendingTags) {
    if (matchedTags.length >= config.maxTrendingTags) break

    const hasMatch = mapping.keywords.some(keyword => text.includes(keyword.toLowerCase()))
    if (!hasMatch) continue

    for (const tag of mapping.tags) {
      if (matchedTags.length >= config.maxTrendingTags) break
      if (existing.has(tag.toLowerCase())) continue

      existing.add(tag.toLowerCase())
      matchedTags.push(tag)
    }
  }

  return matchedTags
}

/**
 * Fetch Open Graph metadata from URL
 */
async function fetchOgMetadata(url: string): Promise<{
  title?: string
  description?: string
  image?: string
}> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UpdayBot/1.0)',
      },
    })

    if (!response.ok) {
      return {}
    }

    const html = await response.text()

    // Extract OG tags with regex
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]

    // Also try twitter:image
    const twitterImage = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1]

    return {
      title: ogTitle,
      description: ogDesc,
      image: ogImage || twitterImage,
    }
  } catch (error) {
    console.warn(`Failed to fetch OG metadata for ${url}:`, error)
    return {}
  }
}

/**
 * Download image from URL and return raw data for uploading
 */
async function fetchImageData(imageUrl: string): Promise<{ data: Uint8Array; contentType: string } | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UpdayBot/1.0)',
      },
    })

    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Check file size (Bluesky limit: 1MB for images)
    if (uint8Array.length > 1000000) {
      console.warn('Image too large, skipping thumbnail')
      return null
    }

    return { data: uint8Array, contentType }
  } catch (error) {
    console.warn(`Failed to fetch image:`, error)
    return null
  }
}

/**
 * Upload image data to a specific Bluesky agent
 */
async function uploadImageToAgent(bskyAgent: BskyAgent, imageData: { data: Uint8Array; contentType: string }): Promise<{ blob: any } | null> {
  try {
    const uploadResult = await bskyAgent.uploadBlob(imageData.data, {
      encoding: imageData.contentType,
    })
    return { blob: uploadResult.data.blob }
  } catch (error) {
    console.warn(`Failed to upload image:`, error)
    return null
  }
}

/**
 * Create post with external embed (link card with image) on a specific agent
 */
async function createPostOnAgent(
  bskyAgent: BskyAgent,
  text: string,
  item: FeedItem,
  ogData: { title?: string; description?: string; image?: string },
  imageData: { data: Uint8Array; contentType: string } | null,
  label: string,
): Promise<{ uri: string; cid: string }> {
  // Create rich text
  const rt = new RichText({ text })
  await rt.detectFacets(bskyAgent)

  // Generate tracking URL for analytics
  const trackingUrl = getTrackingUrl(item.link)

  // Prepare external embed with tracking URL
  const externalEmbed: any = {
    $type: 'app.bsky.embed.external',
    external: {
      uri: trackingUrl,
      title: ogData.title || item.title,
      description: ogData.description || item.description || '',
    },
  }

  // Upload and attach thumbnail image (each agent needs its own upload)
  if (imageData) {
    const imageBlob = await uploadImageToAgent(bskyAgent, imageData)
    if (imageBlob) {
      externalEmbed.external.thumb = imageBlob.blob
    }
  }

  // Create post with embed
  const result = await bskyAgent.post({
    text: rt.text,
    facets: rt.facets,
    embed: externalEmbed,
    createdAt: new Date().toISOString(),
  })

  console.log(`[${label}] Post created: ${result.uri}`)
  return {
    uri: result.uri,
    cid: result.cid,
  }
}

/**
 * Post a feed item to all configured Bluesky accounts
 * Posts the same content to main account and Korean account (if configured)
 */
export async function postFeedItem(item: FeedItem): Promise<{ uri: string; cid: string }> {
  const post = formatPost(item)
  console.log(`Posting: "${item.title.substring(0, 50)}..."`)

  // Fetch OG metadata once (shared between accounts)
  console.log('Fetching OG metadata...')
  const ogData = await fetchOgMetadata(item.link)

  // Fetch image once (shared between accounts, uploaded separately)
  let imageData: { data: Uint8Array; contentType: string } | null = null
  if (ogData.image) {
    console.log(`Found OG image: ${ogData.image.substring(0, 50)}...`)
    imageData = await fetchImageData(ogData.image)
  }

  // Post to main account
  const bskyAgent = await getBlueskyAgent()
  const result = await createPostOnAgent(bskyAgent, post, item, ogData, imageData, 'EN')

  // Post to Korean account (translated content, if configured)
  if (agentKr) {
    try {
      let krPost = post
      if (isTranslationAvailable()) {
        console.log('[KR] Translating post to Korean...')
        krPost = await translatePostToKorean(post)
        console.log(`[KR] Translated: ${krPost.substring(0, 60)}...`)
      }
      await createPostOnAgent(agentKr, krPost, item, ogData, imageData, 'KR')
    } catch (error) {
      console.warn(`[KR] Failed to post (continuing):`, error)
    }
  }

  return result
}

/**
 * Simple post without embed (for testing)
 */
export async function createPost(text: string): Promise<{ uri: string; cid: string }> {
  const bskyAgent = await getBlueskyAgent()

  const rt = new RichText({ text })
  await rt.detectFacets(bskyAgent)

  const result = await bskyAgent.post({
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  })

  console.log(`Post created: ${result.uri}`)
  return {
    uri: result.uri,
    cid: result.cid,
  }
}

/**
 * Verify Bluesky credentials are valid
 */
export async function verifyCredentials(): Promise<{ did: string; handle: string }> {
  const bskyAgent = await getBlueskyAgent()

  const profile = await bskyAgent.getProfile({ actor: bskyAgent.session!.did })

  console.log(`Authenticated as: @${profile.data.handle} (${profile.data.did})`)
  return {
    did: profile.data.did,
    handle: profile.data.handle,
  }
}
