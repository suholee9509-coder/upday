/**
 * Bluesky Auto-Post Script
 *
 * Main entry point for automatically posting new articles to Bluesky
 *
 * Usage:
 *   npx tsx scripts/bluesky/auto-post.ts
 *
 * Environment variables:
 *   BLUESKY_IDENTIFIER, BLUESKY_APP_PASSWORD
 *   RSS_FEED_URL (optional, defaults to https://updayapp.com/feed.xml)
 *   STATE_FILE_PATH (optional, defaults to /tmp/bluesky-auto-post-state.json)
 *   DRY_RUN=true (optional, to test without posting)
 */

// Load environment variables from .env file
import 'dotenv/config'

import { config, validateConfig } from './config'
import { fetchRssFeed, validateFeedItems, type FeedItem } from './rss-parser'
import {
  loadState,
  saveState,
  isAlreadyPosted,
  markAsPosted,
  resetRunStats,
  getFilterDate,
} from './state'
import { initializeBlueskyClient, postFeedItem, verifyCredentials, formatPost } from './bluesky-client'

const DRY_RUN = process.env.DRY_RUN === 'true'

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main(): Promise<void> {
  console.log('====================================')
  console.log('Bluesky Auto-Post Script')
  console.log(`Time: ${new Date().toISOString()}`)
  console.log(`Dry run: ${DRY_RUN}`)
  console.log('====================================\n')

  // Validate configuration
  const validation = validateConfig()
  if (!validation.valid && !DRY_RUN) {
    console.error('Configuration errors:')
    validation.errors.forEach((err) => console.error(`  - ${err}`))
    process.exit(1)
  }

  // Initialize Bluesky client and verify credentials
  if (!DRY_RUN) {
    try {
      await initializeBlueskyClient()
      await verifyCredentials()
    } catch (error) {
      console.error('Failed to initialize Bluesky client:', error)
      process.exit(1)
    }
  }

  // Load state
  let state = loadState()
  state = resetRunStats(state)

  // Fetch RSS feed
  let feed
  try {
    feed = await fetchRssFeed()
  } catch (error) {
    console.error('Failed to fetch RSS feed:', error)
    process.exit(1)
  }

  // Validate feed items
  const { valid: validItems, invalid: invalidItems } = validateFeedItems(feed.items)

  if (invalidItems.length > 0) {
    console.warn(`${invalidItems.length} invalid items skipped`)
  }

  // Filter items to post
  const filterDate = getFilterDate(state)
  console.log(`Filtering items newer than: ${filterDate?.toISOString() || 'N/A (first run)'}`)

  const itemsToPost: FeedItem[] = []

  for (const item of validItems) {
    // Skip if already posted
    if (isAlreadyPosted(state, item.guid)) {
      continue
    }

    // Skip if older than filter date
    if (filterDate && item.pubDate <= filterDate) {
      continue
    }

    itemsToPost.push(item)
  }

  // Sort by date (oldest first) and limit
  itemsToPost.sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime())
  const limitedItems = itemsToPost.slice(0, config.posting.maxPostsPerRun)

  console.log(`\nFound ${itemsToPost.length} new items, will post ${limitedItems.length}`)

  if (limitedItems.length === 0) {
    console.log('No new items to post')
    return
  }

  // Post items
  let successCount = 0
  let failCount = 0

  for (const item of limitedItems) {
    console.log(`\n--- Posting item ---`)
    console.log(`Title: ${item.title}`)
    console.log(`Link: ${item.link}`)
    console.log(`Category: ${item.category}`)
    console.log(`PubDate: ${item.pubDate.toISOString()}`)

    if (DRY_RUN) {
      const previewPost = formatPost(item)
      console.log(`[DRY RUN] Would post:\n${previewPost}`)
      state = markAsPosted(state, item.guid, item.pubDate)
      successCount++
    } else {
      try {
        await postFeedItem(item)
        state = markAsPosted(state, item.guid, item.pubDate)
        successCount++

        // Delay between posts to avoid rate limits
        if (limitedItems.indexOf(item) < limitedItems.length - 1) {
          console.log(`Waiting ${config.posting.delayBetweenPosts}ms before next post...`)
          await sleep(config.posting.delayBetweenPosts)
        }
      } catch (error) {
        console.error(`Failed to post item: ${item.title}`, error)
        failCount++
        // Continue with next item even if one fails
      }
    }
  }

  // Save state
  saveState(state)

  // Print summary
  console.log('\n====================================')
  console.log('Summary')
  console.log('====================================')
  console.log(`Total items in feed: ${feed.items.length}`)
  console.log(`Valid items: ${validItems.length}`)
  console.log(`New items found: ${itemsToPost.length}`)
  console.log(`Posted successfully: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  console.log(`Total posted (all time): ${state.stats.totalPosted}`)
  console.log('====================================\n')

  if (failCount > 0) {
    process.exit(1)
  }
}

// Run the script
main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
